import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";


export const ChatContext = createContext();

export const ChatProvider = ({ children })=>{

    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null)
    const [unseenMessages, setUnseenMessages] = useState({})
    const [isBotTyping, setIsBotTyping] = useState(false)

    const {socket, axios} = useContext(AuthContext);

    // function to get all users for sidebar
    const getUsers = async () =>{
        try {
            const { data } = await axios.get("/api/messages/users");
            if (data.success) {
                setUsers(data.users)
                setUnseenMessages(data.unseenMessages)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // function to get messages for selected user
    const getMessages = async (userId)=>{
        try {
            const { data } = await axios.get(`/api/messages/${userId}`);
            if (data.success){
                setMessages(data.messages)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // function to send message to selected user
    const sendMessage = async (messageData)=>{
        try {
            if (selectedUser?.isBot) {
                setIsBotTyping(true);
            }

            const customApiKey = localStorage.getItem("gemini_api_key");
            const headers = customApiKey ? { "x-gemini-key": customApiKey } : {};

            const {data} = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData, { headers });
            if(data.success){
                setMessages((prevMessages) => {
                    let updated = prevMessages.some(m => m._id === data.newMessage._id)
                        ? prevMessages
                        : [...prevMessages, data.newMessage];

                    if (data.botMessage && !updated.some(m => m._id === data.botMessage._id)) {
                        updated = [...updated, data.botMessage];
                    }
                    return updated;
                });
            }else{
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            if (selectedUser?.isBot) {
                setIsBotTyping(false);
            }
        }
    }

    // function to subscribe to messages for selected user
    const subscribeToMessages = async () =>{
        if(!socket) return;

        socket.on("newMessage", (newMessage)=>{
            if(selectedUser && (newMessage.senderId === selectedUser._id || newMessage.receiverId === selectedUser._id)){
                newMessage.seen = true;
                setMessages((prevMessages) => {
                    if (prevMessages.some(m => m._id === newMessage._id)) return prevMessages;
                    return [...prevMessages, newMessage];
                });
                axios.put(`/api/messages/mark/${newMessage._id}`);
            }else{
                setUnseenMessages((prevUnseenMessages)=>({
                    ...prevUnseenMessages, [newMessage.senderId] : prevUnseenMessages[newMessage.senderId] ? prevUnseenMessages[newMessage.senderId] + 1 : 1
                }))
            }
        });

        socket.on("botTyping", (typingState) => {
            setIsBotTyping(Boolean(typingState));
        });
    }

    // function to unsubscribe from messages
    const unsubscribeFromMessages = ()=>{
        if(socket) {
            socket.off("newMessage");
            socket.off("botTyping");
        }
    }

    useEffect(()=>{
        subscribeToMessages();
        return ()=> unsubscribeFromMessages();
    },[socket, selectedUser])

    const value = {
        messages, users, selectedUser, getUsers, getMessages, sendMessage, setSelectedUser, unseenMessages, setUnseenMessages, isBotTyping, setIsBotTyping
    }

    return (
    <ChatContext.Provider value={value}>
            { children }
    </ChatContext.Provider>
    )
}