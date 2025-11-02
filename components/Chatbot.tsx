
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { MessageAuthor } from '../types';
import { getChatbotResponse } from '../services/geminiService';
import { CloseIcon, SendIcon, ChatIcon } from './IconComponents';

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { author: MessageAuthor.BOT, text: "Hello! I'm Zenith, your wellness assistant. How can I help you today?" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = { author: MessageAuthor.USER, text: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const botResponseText = await getChatbotResponse(messages, inputValue);
      const botMessage: ChatMessage = { author: MessageAuthor.BOT, text: botResponseText };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = { author: MessageAuthor.BOT, text: "Sorry, I couldn't connect. Please try again." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300 z-20"
        aria-label="Open chat"
      >
        <ChatIcon className="w-8 h-8" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 w-[calc(100%-2.5rem)] sm:w-96 h-[70vh] sm:h-[60vh] flex flex-col bg-white rounded-2xl shadow-2xl z-20 transition-transform duration-300 transform scale-100 origin-bottom-right">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 rounded-t-2xl">
        <h3 className="font-bold text-slate-800">Zenith Assistant</h3>
        <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-slate-800">
          <CloseIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-slate-100/50">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-end gap-2 ${msg.author === MessageAuthor.USER ? 'justify-end' : 'justify-start'}`}>
              {msg.author === MessageAuthor.BOT && <div className="w-8 h-8 bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-full flex-shrink-0"></div>}
              <div
                className={`max-w-[80%] p-3 rounded-2xl ${
                  msg.author === MessageAuthor.USER
                    ? 'bg-blue-500 text-white rounded-br-lg'
                    : 'bg-slate-200 text-slate-800 rounded-bl-lg'
                }`}
              >
                <p className="text-sm">{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-end gap-2 justify-start">
              <div className="w-8 h-8 bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-full flex-shrink-0"></div>
              <div className="max-w-[80%] p-3 rounded-2xl bg-slate-200 text-slate-800 rounded-bl-lg">
                <div className="flex items-center space-x-1">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-150"></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-300"></span>
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-200">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-1 w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="w-10 h-10 flex-shrink-0 bg-blue-500 text-white rounded-full flex items-center justify-center disabled:opacity-50"
            disabled={isLoading || !inputValue.trim()}
          >
            <SendIcon className="w-5 h-5"/>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;
