import React, { useContext, useEffect, useRef, useState } from 'react'
import assets from '../assets/assets'
import { formatMessageTime } from '../lib/utils'
import { ChatContext } from '../../context/ChatContext'
import { AuthContext } from '../../context/AuthContext'
import toast from 'react-hot-toast'

// Helper component to render formatted text (Markdown code blocks, bold, lists)
const FormattedMessage = ({ text }) => {
    if (!text) return null;

    // Check for triple-backtick code blocks
    const codeBlockRegex = /```([a-zA-Z]*)\n?([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
        }
        parts.push({
            type: 'code',
            language: match[1] || 'text',
            content: match[2].trim(),
        });
        lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
        parts.push({ type: 'text', content: text.slice(lastIndex) });
    }

    // Helper for inline markdown (**bold**, `inline code`)
    const renderInline = (str) => {
        const inlineRegex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
        const inlineParts = str.split(inlineRegex);

        return inlineParts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('`') && part.endsWith('`')) {
                return (
                    <code key={i} className="bg-black/30 text-cyan-300 px-1 py-0.5 rounded text-xs font-mono">
                        {part.slice(1, -1)}
                    </code>
                );
            }
            return part;
        });
    };

    return (
        <div className="space-y-2 leading-relaxed">
            {parts.map((p, idx) => {
                if (p.type === 'code') {
                    return (
                        <div key={idx} className="my-2 rounded-lg overflow-hidden bg-black/60 border border-violet-500/30 text-xs">
                            <div className="flex justify-between items-center px-3 py-1 bg-violet-900/40 text-gray-300 font-mono text-[11px] border-b border-violet-500/20">
                                <span>{p.language || 'code'}</span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        navigator.clipboard.writeText(p.content);
                                        toast.success("Code copied to clipboard!");
                                    }}
                                    className="hover:text-white transition-colors cursor-pointer"
                                >
                                    Copy
                                </button>
                            </div>
                            <pre className="p-3 overflow-x-auto font-mono text-gray-200 text-xs leading-5">
                                <code>{p.content}</code>
                            </pre>
                        </div>
                    );
                }
                return (
                    <div key={idx} className="whitespace-pre-wrap">
                        {renderInline(p.content)}
                    </div>
                );
            })}
        </div>
    );
};

const ChatContainer = () => {
    const {
        messages,
        selectedUser,
        setSelectedUser,
        sendMessage,
        getMessages,
        isBotTyping
    } = useContext(ChatContext);

    const { authUser, onlineUsers } = useContext(AuthContext);

    const scrollEnd = useRef();
    const [input, setInput] = useState('');
    const [showKeyModal, setShowKeyModal] = useState(false);
    const [apiKeyInput, setApiKeyInput] = useState('');
    const [hasCustomKey, setHasCustomKey] = useState(false);

    useEffect(() => {
        const storedKey = localStorage.getItem("gemini_api_key") || '';
        setApiKeyInput(storedKey);
        setHasCustomKey(Boolean(storedKey));
    }, [showKeyModal]);

    const handleSaveApiKey = () => {
        const trimmed = apiKeyInput.trim();
        if (trimmed) {
            localStorage.setItem("gemini_api_key", trimmed);
            setHasCustomKey(true);
            toast.success("Gemini API Key saved!");
        } else {
            localStorage.removeItem("gemini_api_key");
            setHasCustomKey(false);
            toast.success("Using server default API key");
        }
        setShowKeyModal(false);
    };

    const handleClearApiKey = () => {
        localStorage.removeItem("gemini_api_key");
        setApiKeyInput('');
        setHasCustomKey(false);
        toast.success("Custom API key removed. Using server default.");
        setShowKeyModal(false);
    };

    // Handle sending a message
    const handleSendMessage = async (e) => {
        e?.preventDefault();
        if (input.trim() === "") return;
        const textToSend = input.trim();
        setInput("");
        await sendMessage({ text: textToSend });
    };

    // Handle sending an image
    const handleSendImage = async (e) => {
        const file = e.target.files[0];
        if (!file || !file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }
        const reader = new FileReader();
        reader.onloadend = async () => {
            await sendMessage({ image: reader.result });
            e.target.value = "";
        };
        reader.readAsDataURL(file);
    };

    useEffect(() => {
        if (selectedUser) {
            getMessages(selectedUser._id);
        }
    }, [selectedUser]);

    useEffect(() => {
        if (scrollEnd.current && messages) {
            scrollEnd.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isBotTyping]);

    const starterPrompts = [
        "💡 Explain how WebSockets and Socket.IO work in real time",
        "✍️ Help me write a polite follow-up email for a job interview",
        "💻 How do I optimize React rendering and state updates?",
        "🚀 Suggest 3 innovative full-stack MERN project ideas"
    ];

    return selectedUser ? (
        <div className='h-full overflow-hidden relative backdrop-blur-lg flex flex-col justify-between'>
            {/* ------- Header ------- */}
            <div className='flex items-center gap-3 py-3 mx-4 border-b border-stone-500/60 flex-shrink-0'>
                <div className="relative">
                    <img
                        src={selectedUser.profilePic || assets.avatar_icon}
                        alt=""
                        className={`w-9 aspect-square rounded-full object-cover ${selectedUser.isBot ? 'p-0.5 bg-gradient-to-tr from-violet-500 to-cyan-400' : ''}`}
                    />
                    {(selectedUser.isBot || onlineUsers.includes(selectedUser._id)) && (
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 absolute bottom-0 right-0 border-2 border-[#1a142e]"></span>
                    )}
                </div>

                <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2'>
                        <p className='text-base md:text-lg font-medium text-white truncate'>{selectedUser.fullName}</p>
                        {selectedUser.isBot && (
                            <span className='text-[10px] uppercase font-bold bg-gradient-to-r from-violet-500 to-indigo-500 text-white px-2 py-0.5 rounded-full shadow-sm'>
                                Gemini AI
                            </span>
                        )}
                    </div>
                    <p className='text-xs text-gray-400 truncate'>
                        {selectedUser.isBot
                            ? 'Always active • Multi-modal Assistant'
                            : onlineUsers.includes(selectedUser._id)
                            ? 'Online'
                            : 'Offline'}
                    </p>
                </div>

                {/* AI Bot API Key configuration button */}
                {selectedUser.isBot && (
                    <button
                        onClick={() => setShowKeyModal(true)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all border cursor-pointer ${
                            hasCustomKey
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                                : 'bg-violet-600/20 text-violet-300 border-violet-500/40 hover:bg-violet-600/30'
                        }`}
                        title="Configure Gemini API Key"
                    >
                        <span>🔑</span>
                        <span className="hidden sm:inline">{hasCustomKey ? 'Custom Key Active' : 'API Key'}</span>
                    </button>
                )}

                <img onClick={() => setSelectedUser(null)} src={assets.arrow_icon} alt="" className='md:hidden max-w-7 cursor-pointer' />
                <img src={assets.help_icon} alt="" className='max-md:hidden max-w-5 opacity-60' />
            </div>

            {/* ------- Chat Area ------- */}
            <div className='flex-1 overflow-y-auto p-4 pb-4 space-y-4'>
                {/* Empty State / Welcome card for Gemini AI */}
                {selectedUser.isBot && messages.length === 0 && (
                    <div className="my-6 max-w-lg mx-auto bg-gradient-to-b from-[#282142]/80 to-[#1e1735]/80 border border-violet-500/30 rounded-2xl p-6 text-center text-white shadow-xl backdrop-blur-md">
                        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-tr from-violet-500 to-cyan-400 p-0.5 flex items-center justify-center">
                            <img src={selectedUser.profilePic} alt="Gemini" className="w-full h-full rounded-full object-cover" />
                        </div>
                        <h2 className="text-xl font-semibold mb-1">Meet Gemini AI</h2>
                        <p className="text-sm text-gray-300 mb-5">
                            Your intelligent companion in QuickChat. Ask questions, analyze uploaded images, or brainstorm anytime!
                        </p>

                        <div className="text-xs text-gray-400 mb-3 font-medium text-left">Try asking:</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                            {starterPrompts.map((promptText, i) => (
                                <button
                                    key={i}
                                    onClick={() => sendMessage({ text: promptText.replace(/^[^\s]+\s/, '') })}
                                    className="p-2.5 rounded-xl bg-violet-500/10 hover:bg-violet-500/25 border border-violet-500/20 text-xs text-gray-200 transition-all cursor-pointer text-left"
                                >
                                    {promptText}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Message List */}
                {messages.map((msg, index) => {
                    const isMe = msg.senderId === authUser._id;
                    const isFromBot = selectedUser.isBot && !isMe;

                    return (
                        <div key={index} className={`flex items-end gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                            {!isMe && (
                                <img
                                    src={selectedUser?.profilePic || assets.avatar_icon}
                                    alt=""
                                    className={`w-7 h-7 rounded-full object-cover flex-shrink-0 ${isFromBot ? 'border border-cyan-400/60' : ''}`}
                                />
                            )}

                            <div className={`max-w-[85%] md:max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                {msg.image ? (
                                    <img
                                        src={msg.image}
                                        alt=""
                                        className='max-w-[260px] border border-gray-700 rounded-xl overflow-hidden mb-1 shadow-md'
                                    />
                                ) : (
                                    <div
                                        className={`p-3 md:text-sm font-normal rounded-2xl shadow-sm text-white ${
                                            isMe
                                                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 rounded-br-none'
                                                : isFromBot
                                                ? 'bg-[#251e3e] border border-violet-500/30 rounded-bl-none'
                                                : 'bg-violet-500/25 border border-white/10 rounded-bl-none'
                                        }`}
                                    >
                                        <FormattedMessage text={msg.text} />
                                    </div>
                                )}
                                <span className='text-[10px] text-gray-400 mt-1 px-1'>
                                    {formatMessageTime(msg.createdAt)}
                                </span>
                            </div>

                            {isMe && (
                                <img
                                    src={authUser?.profilePic || assets.avatar_icon}
                                    alt=""
                                    className='w-7 h-7 rounded-full object-cover flex-shrink-0'
                                />
                            )}
                        </div>
                    );
                })}

                {/* AI Thinking / Typing Indicator */}
                {isBotTyping && selectedUser.isBot && (
                    <div className="flex items-end gap-2.5 justify-start">
                        <img
                            src={selectedUser.profilePic}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover flex-shrink-0 border border-cyan-400/60"
                        />
                        <div className="px-4 py-2.5 rounded-2xl rounded-bl-none bg-[#251e3e] border border-violet-500/30 text-white text-xs flex items-center gap-2">
                            <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-bounce"></span>
                            <span className="inline-block w-2 h-2 rounded-full bg-violet-400 animate-bounce [animation-delay:0.2s]"></span>
                            <span className="inline-block w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]"></span>
                            <span className="text-gray-300 ml-1 font-mono text-[11px]">Gemini is typing...</span>
                        </div>
                    </div>
                )}

                <div ref={scrollEnd}></div>
            </div>

            {/* ------- Bottom Input Area ------- */}
            <div className='flex items-center gap-3 p-3 mx-2 mb-2 bg-[#20183b]/70 border border-violet-500/20 rounded-full flex-shrink-0'>
                <input
                    onChange={(e) => setInput(e.target.value)}
                    value={input}
                    onKeyDown={(e) => e.key === "Enter" ? handleSendMessage(e) : null}
                    type="text"
                    placeholder={selectedUser.isBot ? "Ask Gemini anything..." : "Send a message..."}
                    className='flex-1 text-sm px-3 bg-transparent border-none outline-none text-white placeholder-gray-400'
                />
                <input onChange={handleSendImage} type="file" id='image' accept='image/png, image/jpeg' hidden />
                <label htmlFor="image" title="Attach an image">
                    <img src={assets.gallery_icon} alt="" className="w-5 mr-1 cursor-pointer opacity-80 hover:opacity-100 transition-opacity" />
                </label>
                <button
                    onClick={handleSendMessage}
                    type="button"
                    className="p-1 rounded-full hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                >
                    <img src={assets.send_button} alt="Send" className="w-7" />
                </button>
            </div>

            {/* ------- Gemini API Key Modal ------- */}
            {showKeyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-[#1f1936] border border-violet-500/40 rounded-2xl p-6 max-w-md w-full text-white shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <span>🔑</span> Configure Gemini API Key
                            </h3>
                            <button
                                onClick={() => setShowKeyModal(false)}
                                className="text-gray-400 hover:text-white text-xl cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <p className="text-xs text-gray-300 mb-4 leading-relaxed">
                            You can provide your own personal Google Gemini API key. It is stored safely in your browser and used for your requests.
                        </p>

                        <div className="mb-4">
                            <label className="block text-xs font-medium text-gray-300 mb-1.5">
                                Google Gemini API Key:
                            </label>
                            <input
                                type="password"
                                value={apiKeyInput}
                                onChange={(e) => setApiKeyInput(e.target.value)}
                                placeholder="AIzaSy..."
                                className="w-full px-3 py-2 bg-black/40 border border-violet-500/30 rounded-lg text-sm text-white placeholder-gray-500 outline-none focus:border-violet-400"
                            />
                        </div>

                        <div className="p-3 bg-violet-950/40 border border-violet-500/20 rounded-lg mb-5 text-[11px] text-gray-300">
                            <span>Don't have a key? </span>
                            <a
                                href="https://aistudio.google.com/app/apikey"
                                target="_blank"
                                rel="noreferrer"
                                className="text-cyan-400 hover:underline font-medium"
                            >
                                Get a free API key at Google AI Studio ↗
                            </a>
                        </div>

                        <div className="flex justify-end gap-2">
                            {hasCustomKey && (
                                <button
                                    onClick={handleClearApiKey}
                                    className="px-3 py-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 text-xs transition-colors cursor-pointer"
                                >
                                    Reset to Default
                                </button>
                            )}
                            <button
                                onClick={() => setShowKeyModal(false)}
                                className="px-4 py-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 text-xs transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveApiKey}
                                className="px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-medium transition-all shadow-md cursor-pointer"
                            >
                                Save Key
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    ) : (
        <div className='flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden h-full'>
            <img src={assets.logo_icon} className='max-w-16' alt="" />
            <p className='text-lg font-medium text-white'>Chat anytime, anywhere</p>
            <p className='text-xs text-gray-400'>Select a user or Gemini AI to start messaging</p>
        </div>
    );
};

export default ChatContainer;
