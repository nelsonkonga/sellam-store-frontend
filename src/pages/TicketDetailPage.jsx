import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import supportService from '../services/supportService';
import { ArrowLeft, Send, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadTicket();
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [ticketData]);

  const loadTicket = async () => {
    try {
      const data = await supportService.getTicketDetail(id);
      setTicketData(data);
    } catch (err) {
      setError('Erreur lors du chargement du ticket.');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      setSending(true);
      await supportService.addMessage(id, newMessage);
      setNewMessage('');
      await loadTicket();
    } catch (err) {
      setError('Erreur lors de l\'envoi du message');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="p-6 text-center text-text-muted">Chargement...</div>;
  if (!ticketData) return <div className="p-6 text-center text-red-500">{error}</div>;

  const { ticket, messages } = ticketData;
  const isClosed = ticket.status === 'RESOLVED' || ticket.status === 'CLOSED';

  return (
    <div className="mx-auto flex h-[calc(100vh-6rem)] max-w-6xl flex-col p-5 md:p-8">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-4 border-b border-[#bdc9c1] bg-white p-5">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-body rounded-full text-text-muted hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div><p className="text-xs font-bold uppercase tracking-[0.08em] text-[#006547]">Support / Ticket</p><h1 className="font-display text-xl font-semibold text-text-primary">{ticket.subject}</h1></div>
          <p className="text-sm text-text-muted">Ticket #{ticket.id.substring(0,8)} • {ticket.status}</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto border-x border-divider bg-body p-6">
        <div className="space-y-6">
          {messages.map((msg) => {
            if (msg.isSystemMessage) {
              return (
                <div key={msg.id} className="flex justify-center my-4">
                  <div className="bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" />
                    {msg.message}
                  </div>
                </div>
              );
            }

            const isMe = msg.senderId === user?.id;
            
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <span className="text-xs text-text-muted mb-1 px-1">
                  {isMe ? 'Vous' : msg.senderName} • {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
                <div className={`px-4 py-2 rounded-2xl max-w-[80%] whitespace-pre-wrap ${
                  isMe 
                    ? 'bg-primary text-white rounded-br-none' 
                    : 'bg-section border border-divider text-text-primary rounded-bl-none'
                }`}>
                  {msg.message}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-section p-4 border-t border-divider rounded-b-xl shrink-0">
        {isClosed ? (
          <div className="text-center text-text-muted text-sm py-2">
            Ce ticket est clôturé. Les réponses ne sont plus possibles.
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Écrivez votre message..."
              className="flex-1 bg-body border border-divider rounded-full px-5 py-3 text-text-primary focus:border-primary focus:outline-none"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="bg-primary hover:bg-primary-hover text-white p-3 rounded-full transition-colors disabled:opacity-50 flex items-center justify-center shrink-0"
            >
              <Send className="w-5 h-5 ml-1" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
