import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useChatService from '../hooks/useChatService';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { Send, AlertCircle, Loader, MessageSquare } from 'lucide-react';

const ChatPage = () => {
  const { accountId } = useAuth();
  const { selectedShopId, selectedShopName } = useShop();
  const navigate = useNavigate();
  const conversationId = selectedShopId;
  const { messages, isConnected, error, sendMessage } = useChatService(conversationId);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim() && isConnected) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className="flex h-screen flex-col bg-[#f1fcf5] text-[#141e1a]">
      {/* Header */}
      <div className="border-b border-[#bdc9c1] bg-white p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#006547]">Espace / Support</p><h1 className="font-display text-2xl font-semibold text-[#141e1a]">
          Chat — {selectedShopName || 'Boutique'}
        </h1>
        <div className="flex items-center gap-2 mt-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 p-3 flex items-center gap-2">
          <AlertCircle className="text-red-600 dark:text-red-400" size={20} />
          <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
          <button
            type="button"
            onClick={() => navigate('/support')}
            className="ml-auto flex shrink-0 items-center gap-1.5 rounded-lg border border-red-300 px-2.5 py-1.5 text-xs font-medium text-red-700 dark:border-red-700 dark:text-red-300"
          >
            <MessageSquare size={14} /> Ouvrir un ticket
          </button>
        </div>
      )}

      {/* Messages Area */}
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col space-y-4 overflow-y-auto p-5">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <p>No messages yet. Start a conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.senderId === accountId ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.senderId === accountId
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
                }`}
              >
                <p className="text-xs font-semibold mb-1 opacity-75">
                  {msg.senderName}
                </p>
                <p className="break-words">{msg.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-[#bdc9c1] bg-white p-4 shadow-lg">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            disabled={!isConnected}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSendMessage}
            disabled={!isConnected || !inputValue.trim()}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isConnected ? <Send size={18} /> : <Loader size={18} className="animate-spin" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
