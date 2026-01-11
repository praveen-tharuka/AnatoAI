"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Activity, AlertCircle, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface OverlayProps {
  selectedPart: string | null;
  onClose: () => void;
  gender: "male" | "female";
}

export default function Overlay({ selectedPart, onClose, gender }: OverlayProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const sendMessageToApi = async (msgs: Message[], part: string) => {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: msgs, 
          selectedPart: part,
          gender: gender
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      return data;
    } catch (error) {
      console.error("Failed to send message:", error);
      return { role: "assistant", content: "Sorry, I'm having trouble connecting right now. Please try again later." };
    }
  };

  useEffect(() => {
    let isMounted = true;

    if (selectedPart) {
      setMessages([]);
      setLoading(true);
      
      // Initial AI greeting
      sendMessageToApi([], selectedPart).then((response) => {
        if (isMounted) {
          setMessages([response]);
          setLoading(false);
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [selectedPart]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedPart) return;

    const newMessages = [...messages, { role: "user", content: input } as Message];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const response = await sendMessageToApi(newMessages, selectedPart);
    
    setMessages((prev) => [...prev, response]);
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {selectedPart && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 h-full w-full md:w-[480px] bg-white/95 backdrop-blur-xl shadow-2xl border-l border-blue-100 z-50 flex flex-col text-slate-800 font-sans"
        >
          {/* Header */}
          <div className="p-6 border-b border-blue-200 flex justify-between items-center bg-gradient-to-r from-blue-50 to-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg border border-blue-200">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight font-sans">{selectedPart}</h2>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider font-sans">Analysis Active</p>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-blue-50 rounded-full transition-colors text-slate-500 hover:text-slate-800"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gradient-to-b from-white to-blue-50/30" ref={scrollRef}>
            {messages.length === 0 && loading && (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-blue-600 animate-pulse" />
                </div>
                <p className="text-sm font-semibold animate-pulse font-sans text-slate-700">Analyzing {selectedPart}...</p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-2xl shadow-md font-sans ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white border border-blue-200 text-slate-700 rounded-bl-none shadow-sm"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-blue-200">
                      <Sparkles className="w-3 h-3 text-blue-600" />
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-wider font-sans">AI Assistant</span>
                    </div>
                  )}
                  <div className="prose prose-sm max-w-none leading-relaxed">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({node, ...props}) => <h1 className="text-lg font-bold text-blue-700 mb-2 mt-4 font-sans" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-base font-bold text-blue-600 mb-2 mt-3 font-sans" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-sm font-bold text-blue-600 mb-1 mt-2 font-sans" {...props} />,
                        p: ({node, ...props}) => <p className="mb-2 last:mb-0 text-slate-700 font-sans" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc list-outside ml-4 mb-2 space-y-1" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-4 mb-2 space-y-1" {...props} />,
                        li: ({node, ...props}) => <li className="text-slate-700 font-sans" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-bold text-slate-800 font-sans" {...props} />,
                        a: ({node, ...props}) => <a className="text-blue-600 hover:text-blue-700 hover:underline font-sans" target="_blank" rel="noopener noreferrer" {...props} />,
                        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-300 pl-4 italic text-slate-600 my-2 bg-blue-50/50 py-2 rounded-r font-sans" {...props} />,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {loading && messages.length > 0 && (
              <div className="flex justify-start">
                <div className="bg-white border border-blue-200 p-4 rounded-2xl rounded-bl-none flex items-center gap-2 shadow-sm">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-blue-200">
            <form onSubmit={handleSendMessage} className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about symptoms, treatments..."
                className="w-full pl-4 pr-12 py-4 bg-blue-50 border border-blue-200 rounded-xl text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-inner font-sans"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="absolute right-2 top-2 bottom-2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500 font-sans">
              <AlertCircle className="w-3 h-3 text-slate-400" />
              <span>AI can make mistakes. Consult a doctor for medical advice.</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
