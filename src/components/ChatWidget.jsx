import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, X, Send, Mic, MicOff, Minimize2, Maximize2, Sparkles } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { sendMessageToISAC } from '../services/chatService';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Hello! I'm ISAC, your intelligent study assistant. How can I help you today?",
            sender: 'ai',
            timestamp: new Date().toISOString(),
        }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const messagesEndRef = useRef(null);
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen, isTyping]);

    const toggleVoiceInput = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert("Voice input is not supported in this browser. Please use Chrome or Edge.");
            return;
        }

        if (isListening) {
            setIsListening(false);
            return;
        }

        setIsListening(true);
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setMessage(transcript);
            setIsListening(false);
            // Optional: Auto-send after voice input
            // handleSendMessage({ preventDefault: () => {} }); 
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        // Add user message
        const userMsg = {
            id: Date.now(),
            text: message,
            sender: 'user',
            timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, userMsg]);
        setMessage('');
        setIsTyping(true);

        try {
            // Call ISAC service
            const response = await sendMessageToISAC(userMsg.text, messages);

            const aiMsg = {
                id: Date.now() + 1,
                text: response.text,
                sender: 'ai',
                timestamp: new Date().toISOString(),
            };
            setMessages(prev => [...prev, aiMsg]);

            // Handle Actions (Navigation)
            if (response.action && response.action.type === 'navigate') {
                setTimeout(() => {
                    navigate(response.action.payload);
                }, 1000);
            }

        } catch (error) {
            const errorMsg = {
                id: Date.now() + 1,
                text: "Sorry, I'm having trouble connecting to my brain right now.",
                sender: 'ai',
                timestamp: new Date().toISOString(),
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
        setIsMinimized(false);
    };

    if (!user) return null;

    return (
        <div className="fixed bottom-20 md:bottom-8 right-4 z-50 flex flex-col items-end print:hidden">
            {/* Chat Window */}
            {isOpen && (
                <div
                    className={`bg-white rounded-xl shadow-2xl border border-gray-200 w-full md:w-96 mb-4 transition-all duration-300 ease-in-out flex flex-col overflow-hidden ${isMinimized ? 'h-14' : 'h-[500px]'
                        }`}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-4 flex items-center justify-between text-white shrink-0 shadow-md">
                        <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                                <Sparkles className="h-5 w-5 text-yellow-300" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm tracking-wide">ISAC</h3>
                                <span className="text-[10px] text-primary-100 flex items-center font-medium opacity-90">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5 animate-pulse"></span>
                                    AI Assistant Online
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-1">
                            <button
                                onClick={() => setIsMinimized(!isMinimized)}
                                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                                title={isMinimized ? "Maximize" : "Minimize"}
                            >
                                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                            </button>
                            <button
                                onClick={toggleChat}
                                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                                title="Close"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    {!isMinimized && (
                        <>
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 scroll-smooth">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${msg.sender === 'user'
                                                ? 'bg-primary-600 text-white rounded-br-none'
                                                : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'
                                                }`}
                                        >
                                            <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                            <span className={`text-[10px] mt-1.5 block text-right opacity-70 ${msg.sender === 'user' ? 'text-primary-100' : 'text-gray-400'
                                                }`}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {isTyping && (
                                    <div className="flex justify-start">
                                        <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                                            <div className="flex space-x-1.5">
                                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-3 bg-white border-t border-gray-100">
                                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                                    <button
                                        type="button"
                                        className={`p-2.5 rounded-full transition-all duration-200 ${isListening
                                            ? 'bg-red-50 text-red-500 ring-2 ring-red-100 animate-pulse'
                                            : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
                                            }`}
                                        onClick={toggleVoiceInput}
                                        title={isListening ? "Stop Listening" : "Start Voice Input"}
                                    >
                                        {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                                    </button>
                                    <input
                                        type="text"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder={isListening ? "Listening..." : "Ask ISAC anything..."}
                                        className={`flex-1 border-0 bg-gray-50 rounded-full px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-100 focus:bg-white transition-all placeholder-gray-400 ${isListening ? 'placeholder-primary-500' : ''
                                            }`}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!message.trim()}
                                        className="p-2.5 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md active:scale-95"
                                    >
                                        <Send className="h-4 w-4" />
                                    </button>
                                </form>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={toggleChat}
                className={`${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
                    } transition-all duration-300 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white p-4 rounded-full shadow-xl flex items-center justify-center group relative overflow-hidden`}
            >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-full"></div>
                <MessageSquare className="h-6 w-6 relative z-10 group-hover:scale-110 transition-transform duration-200" />

                {/* Notification Badge (Optional - can be connected to unread messages later) */}
                <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>

                <span className="absolute right-full mr-4 bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap shadow-lg translate-x-2 group-hover:translate-x-0">
                    Chat with ISAC
                </span>
            </button>
        </div >
    );
};

export default ChatWidget;
