import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

const useChatService = (conversationId) => {
  const { token, accountId } = useAuth();
  const { currentShop } = useShop();
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const stompClient = useRef(null);

  useEffect(() => {
    if (!conversationId || !token || !currentShop) return;

    const connectSocket = () => {
      try {
        const socket = new SockJS('http://localhost:8080/ws-chat');
        stompClient.current = Stomp.over(socket);

        stompClient.current.connect(
          {},
          () => {
            setIsConnected(true);
            setError(null);

            stompClient.current.subscribe(
              `/topic/chat/${conversationId}`,
              (message) => {
                try {
                  const newMessage = JSON.parse(message.body);
                  setMessages((prev) => [...prev, newMessage]);
                } catch (err) {
                  console.error('Error parsing message:', err);
                }
              }
            );

            loadChatHistory(conversationId);
          },
          (err) => {
            setError('Chat backend unavailable on localhost:8080');
            setIsConnected(false);
            console.error('STOMP connection error:', err);
          }
        );
      } catch (err) {
        setError('Unable to initialize the chat client');
        console.error('Socket init error:', err);
      }
    };

    connectSocket();

    return () => {
      if (stompClient.current && stompClient.current.connected) {
        stompClient.current.disconnect(() => {
          setIsConnected(false);
        });
      }
    };
  }, [conversationId, token, currentShop]);

  const sendMessage = (content) => {
    if (!stompClient.current || !stompClient.current.connected) {
      setError('Not connected to chat');
      return;
    }

    const messageDTO = {
      shopId: currentShop.id,
      senderId: accountId,
      senderName: currentShop.name || 'User',
      content,
      conversationId,
    };

    stompClient.current.send(`/app/chat/${conversationId}`, {}, JSON.stringify(messageDTO));
  };

  const loadChatHistory = async (convId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/chat/history/${convId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const history = await response.json();
        setMessages(history);
      }
    } catch (err) {
      console.error('Error loading chat history:', err);
      setError('Failed to load chat history');
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
