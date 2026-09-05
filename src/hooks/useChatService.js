import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

const useChatService = (conversationId) => {
  const { token, accountId } = useAuth();
  const { selectedShop } = useShop();
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const stompClient = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = useRef(1000);

  // Get backend URL from environment or derive from API URL
  const getBackendUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
    // Remove '/api' suffix if present
    return apiUrl.replace(/\/api\/?$/, '');
  };

  useEffect(() => {
    if (!conversationId || !token || !selectedShop) return;

    const connectSocket = () => {
      try {
        const backendUrl = getBackendUrl();
        const socketUrl = `${backendUrl}/ws-chat`;
        
        console.log(`[Chat] Connecting to WebSocket: ${socketUrl}`);
        
        const socket = new SockJS(socketUrl);
        stompClient.current = Stomp.over(socket);
        
        // Suppress STOMP debug logging in production
        if (import.meta.env.MODE !== 'development') {
          stompClient.current.debug = () => {};
        }

        stompClient.current.connect(
          { Authorization: `Bearer ${token}` },
          () => {
            console.log('[Chat] WebSocket connected');
            setIsConnected(true);
            setError(null);
            reconnectAttempts.current = 0;
            reconnectDelay.current = 1000;

            stompClient.current.subscribe(
              `/topic/chat/${conversationId}`,
              (message) => {
                try {
                  const newMessage = JSON.parse(message.body);
                  setMessages((prev) => [...prev, newMessage]);
                  console.log('[Chat] Message received:', newMessage);
                } catch (err) {
                  console.error('[Chat] Error parsing message:', err);
                }
              },
              (err) => {
                console.error('[Chat] Subscription error:', err);
              }
            );

            loadChatHistory(conversationId);
          },
          (err) => {
            console.error('[Chat] STOMP connection error:', err);
            setIsConnected(false);
            
            if (typeof err === 'string') {
              setError(`Chat connection failed: ${err}`);
            } else if (err && err.message) {
              setError(`Chat connection failed: ${err.message}`);
            } else {
              setError('Chat backend is unavailable. Please try again later.');
            }
            
            // Attempt reconnection
            if (reconnectAttempts.current < maxReconnectAttempts) {
              reconnectAttempts.current++;
              console.log(`[Chat] Attempting reconnection (${reconnectAttempts.current}/${maxReconnectAttempts})...`);
              setTimeout(connectSocket, reconnectDelay.current);
              reconnectDelay.current = Math.min(reconnectDelay.current * 2, 30000); // Max 30s
            } else {
              setError('Chat connection failed after multiple attempts. Please refresh the page.');
            }
          }
        );
      } catch (err) {
        console.error('[Chat] Socket initialization error:', err);
        setError('Unable to initialize chat. Please refresh the page.');
        setIsConnected(false);
      }
    };

    connectSocket();

    return () => {
      if (stompClient.current && stompClient.current.connected) {
        try {
          stompClient.current.disconnect(() => {
            console.log('[Chat] Disconnected');
            setIsConnected(false);
          });
        } catch (err) {
          console.error('[Chat] Disconnect error:', err);
        }
      }
    };
  }, [conversationId, token, selectedShop]);

  const sendMessage = (content) => {
    if (!selectedShop || !stompClient.current || !stompClient.current.connected) {
      setError('Not connected to chat. Attempting to reconnect...');
      reconnectAttempts.current = 0; // Reset to force reconnection
      return;
    }

    const messageDTO = {
      shopId: selectedShop.id,
      senderId: accountId,
      senderName: selectedShop.name || 'User',
      content,
      conversationId,
    };

    try {
      stompClient.current.send(
        `/app/chat/${conversationId}`,
        { Authorization: `Bearer ${token}` },
        JSON.stringify(messageDTO)
      );
      console.log('[Chat] Message sent:', messageDTO);
    } catch (err) {
      console.error('[Chat] Error sending message:', err);
      setError('Failed to send message. Please check your connection.');
    }
  };

  const loadChatHistory = async (convId) => {
    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/chat/history/${convId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const history = await response.json();
        setMessages(history);
        console.log(`[Chat] Loaded ${history.length} messages from history`);
      } else {
        console.warn(`[Chat] Failed to load history: ${response.status}`);
      }
    } catch (err) {
      console.error('[Chat] Error loading chat history:', err);
      // Don't set error here - history loading is not critical
    }
  };

  return {
    messages,
    isConnected,
    error,
    sendMessage,
  };
};

export default useChatService;
