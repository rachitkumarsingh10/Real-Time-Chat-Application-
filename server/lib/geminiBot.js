import User from "../models/User.js";

export const GEMINI_BOT_EMAIL = "gemini@quickchat.ai";

/**
 * Ensure the Gemini AI Bot user exists in the MongoDB database
 */
export const ensureBotUser = async () => {
    try {
        let bot = await User.findOne({ 
            $or: [{ email: GEMINI_BOT_EMAIL }, { isBot: true }] 
        });

        if (!bot) {
            bot = await User.create({
                email: GEMINI_BOT_EMAIL,
                fullName: "Gemini AI",
                password: "gemini_ai_bot_secure_password_98765",
                profilePic: "https://api.dicebear.com/7.x/bottts/svg?seed=GeminiAI&backgroundColor=b6e3f4,c0aede,d1d4f9",
                bio: "✨ Intelligent AI Assistant powered by Google Gemini. Ask questions, brainstorm, debug code, or chat!",
                isBot: true,
            });
            console.log("Created Gemini AI Bot user:", bot._id);
        } else if (!bot.isBot) {
            bot.isBot = true;
            await bot.save();
        }

        return bot;
    } catch (error) {
        console.error("Error in ensureBotUser:", error.message);
        return null;
    }
};

/**
 * Convert an image URL or Base64 data URL into inlineData for Gemini API
 */
const prepareImagePart = async (imageSource) => {
    try {
        if (!imageSource) return null;

        // If it's already a base64 data URL (e.g. data:image/png;base64,...)
        const dataUrlMatch = imageSource.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
        if (dataUrlMatch) {
            return {
                inlineData: {
                    mimeType: dataUrlMatch[1],
                    data: dataUrlMatch[2],
                },
            };
        }

        // If it's an HTTP/HTTPS URL (e.g. Cloudinary)
        if (imageSource.startsWith("http://") || imageSource.startsWith("https://")) {
            const response = await fetch(imageSource);
            if (!response.ok) return null;
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const mimeType = response.headers.get("content-type") || "image/jpeg";
            return {
                inlineData: {
                    mimeType,
                    data: buffer.toString("base64"),
                },
            };
        }

        return null;
    } catch (err) {
        console.error("Failed to prepare image for Gemini:", err.message);
        return null;
    }
};

/**
 * Generate an AI response using Google Gemini API
 */
export const generateGeminiReply = async ({ prompt, image, history = [], botId, customApiKey }) => {
    const apiKey = customApiKey?.trim() || process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) {
        return (
            "⚠️ **Google Gemini API Key Not Configured**\n\n" +
            "To chat with Gemini AI:\n" +
            "1. Get a free API key at [Google AI Studio](https://aistudio.google.com/app/apikey).\n" +
            "2. Click the **🔑 API Key** button in the chat header to enter your key, OR add `GEMINI_API_KEY=your_key` to your `server/.env` file."
        );
    }

    try {
        // Build multi-turn conversational contents
        const contents = [];

        // Append recent conversation history
        for (const msg of history) {
            if (!msg.text) continue;
            const role = (botId && msg.senderId?.toString() === botId.toString()) ? "model" : "user";
            contents.push({
                role,
                parts: [{ text: msg.text }],
            });
        }

        // Build current user message parts (text + optional image)
        const currentParts = [];
        if (image) {
            const imagePart = await prepareImagePart(image);
            if (imagePart) currentParts.push(imagePart);
        }
        if (prompt && prompt.trim()) {
            currentParts.push({ text: prompt.trim() });
        } else if (currentParts.length === 0) {
            currentParts.push({ text: "Hello!" });
        }

        contents.push({
            role: "user",
            parts: currentParts,
        });

        // Models to try (gemini-2.5-flash with fallback to gemini-1.5-flash)
        const models = ["gemini-2.5-flash", "gemini-1.5-flash"];
        let lastError = null;

        for (const model of models) {
            try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
                const response = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents,
                        systemInstruction: {
                            parts: [
                                {
                                    text: "You are Gemini AI, a smart, friendly, and helpful AI assistant in QuickChat. Answer questions clearly, accurately, and pleasantly. Format your answers with markdown (bullet points, bold text, code blocks) when appropriate.",
                                },
                            ],
                        },
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 2048,
                        },
                    }),
                });

                const data = await response.json();

                if (!response.ok) {
                    const errorMsg = data?.error?.message || `HTTP ${response.status}`;
                    lastError = errorMsg;
                    // If model is not found, try the next model
                    continue;
                }

                const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (replyText) {
                    return replyText;
                }
            } catch (err) {
                lastError = err.message;
            }
        }

        return `⚠️ **Gemini AI could not generate a response**: ${lastError || "Unknown error"}. Please check your API key and permissions at Google AI Studio.`;
    } catch (error) {
        console.error("Gemini generation error:", error);
        return `⚠️ **Error communicating with Gemini AI**: ${error.message}`;
    }
};
