import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js"
import { io, userSocketMap } from "../server.js";
import { ensureBotUser, generateGeminiReply } from "../lib/geminiBot.js";


// Get all users except the logged in user
export const getUsersForSidebar = async (req, res)=>{
    try {
        const userId = req.user._id;

        // Ensure Gemini AI Bot user exists in the database
        await ensureBotUser();

        const filteredUsers = await User.find({_id: {$ne: userId}}).select("-password");

        // Pin AI Bot to the top of the user list
        filteredUsers.sort((a, b) => {
            if (a.isBot && !b.isBot) return -1;
            if (!a.isBot && b.isBot) return 1;
            return 0;
        });

        // Count number of messages not seen
        const unseenMessages = {}
        const promises = filteredUsers.map(async (user)=>{
            const messages = await Message.find({senderId: user._id, receiverId: userId, seen: false})
            if(messages.length > 0){
                unseenMessages[user._id] = messages.length;
            }
        })
        await Promise.all(promises);
        res.json({success: true, users: filteredUsers, unseenMessages})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// Get all messages for selected user
export const getMessages = async (req, res) =>{
    try {
        const { id: selectedUserId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                {senderId: myId, receiverId: selectedUserId},
                {senderId: selectedUserId, receiverId: myId},
            ]
        })
        await Message.updateMany({senderId: selectedUserId, receiverId: myId}, {seen: true});

        res.json({success: true, messages})


    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// api to mark message as seen using message id
export const markMessageAsSeen = async (req, res)=>{
    try {
        const { id } = req.params;
        await Message.findByIdAndUpdate(id, {seen: true})
        res.json({success: true})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// Send message to selected user
export const sendMessage = async (req, res) =>{
    try {
        const {text, image} = req.body;
        const receiverId = req.params.id;
        const senderId = req.user._id;

        let imageUrl;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image)
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = await Message.create({
            senderId,
            receiverId,
            text,
            image: imageUrl
        });

        // Check if the receiver is the Gemini AI Bot
        const receiverUser = await User.findById(receiverId);
        if (receiverUser?.isBot) {
            const senderSocketId = userSocketMap[senderId];
            if (senderSocketId) {
                io.to(senderSocketId).emit("botTyping", true);
            }

            // Retrieve conversation history for multi-turn context
            const historyMessages = await Message.find({
                $or: [
                    { senderId, receiverId },
                    { senderId: receiverId, receiverId: senderId }
                ]
            }).sort({ createdAt: -1 }).limit(10);
            historyMessages.reverse();

            // Support custom API key provided via client header
            const customApiKey = req.headers["x-gemini-key"];

            // Generate AI response from Google Gemini
            const aiResponseText = await generateGeminiReply({
                prompt: text,
                image: image || imageUrl,
                history: historyMessages,
                botId: receiverId,
                customApiKey
            });

            // Save AI reply to database
            const botMessage = await Message.create({
                senderId: receiverId,
                receiverId: senderId,
                text: aiResponseText,
                seen: true
            });

            if (senderSocketId) {
                io.to(senderSocketId).emit("botTyping", false);
                io.to(senderSocketId).emit("newMessage", botMessage);
            }

            return res.json({ success: true, newMessage, botMessage });
        }

        // Standard user-to-user messaging: Emit to receiver's socket
        const receiverSocketId = userSocketMap[receiverId];
        if (receiverSocketId){
            io.to(receiverSocketId).emit("newMessage", newMessage)
        }

        res.json({success: true, newMessage});

    } catch (error) {
        console.log("Error in sendMessage:", error.message);
        res.json({success: false, message: error.message})
    }
}