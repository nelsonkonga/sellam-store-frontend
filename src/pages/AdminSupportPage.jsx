import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supportService from '../services/supportService';
import { Shield, Search, Unlock, MessageSquare, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');
  
  // Reset limit modal
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetUserId, setResetUserId] = useState('');
  const [resetReason, setResetReason] = useState('');
  const [resetTicketId, setResetTicketId] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const data = await supportService.listAllTickets();
      setTickets(data);
    } catch (err) {
      setError('Erreur lors du chargement des tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await supportService.updateTicketStatus(ticketId, newStatus);
      await loadTickets();
    } catch (err) {
      setError('Erreur lors du changement de statut');
    }
  };

  const handleResetLimit = async (e) => {
    e.preventDefault();
    if (!resetUserId.trim() || !resetReason.trim()) return;

    try {
      setResetLoading(true);
      await supportService.resetIdentityLimits(
        resetUserId.trim(),
        resetReason.trim(),
        resetTicketId.trim() || null
      );
      setResetSuccess('Limite réinitialisée avec succès. L\'action a été enregistrée dans le journal d\'audit.');
      setResetUserId('');
      setResetReason('');
      setResetTicketId('');
      setTimeout(() => {
        setShowResetModal(false);
        setResetSuccess('');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la réinitialisation');
    } finally {
      setResetLoading(false);
    }
  };

  const translateStatus = (status) => {
    const map = {
      'OPEN': 'Ouvert',
      'IN_PROGRESS': 'En cours',
      'WAITING_FOR_USER': 'Attente client',
      'RESOLVED': 'Résolu',
      'CLOSED': 'Fermé'
    };
    return map[status] || status;
  };

  const priorityIcon = (priority) => {
    switch(priority) {
      case 'CRITICAL': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'HIGH': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default: return null;
    }
  };

  const statusColor = (status) => {
    switch(status) {
      case 'OPEN': return 'text-green-500 bg-green-500/10';
      case 'IN_PROGRESS': return 'text-blue-500 bg-blue-500/10';
      case 'WAITING_FOR_USER': return 'text-yellow-500 bg-yellow-500/10';
      case 'RESOLVED': return 'text-gray-400 bg-gray-400/10';
      case 'CLOSED': return 'text-gray-500 bg-gray-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const filteredTickets = filter === 'ALL'
    ? tickets
    : tickets.filter(t => t.status === filter);

  if (loading) return <div className="p-6 text-center text-text-muted">Chargement...</div>;

  return (
    <div className="min-h-screen bg-[#f1fcf5] p-5 text-[#141e1a] md:p-8">
      <div className="mx-auto flex max-w-7xl items-end justify-between border-b border-[#bdc9c1] pb-6">
        <div className="flex items-center gap-3">
          <Shield className="w-7 h-7 text-primary" />
          <div><p className="text-xs font-bold uppercase tracking-[0.08em] text-[#006547]">Espace sécurisé</p><h1 className="font-display text-3xl font-bold text-text-primary">Administration Support</h1></div>
        </div>
        <button
          onClick={() => setShowResetModal(true)}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Unlock className="w-5 h-5" />
          Débloquer limite identité
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['ALL', 'OPEN', 'IN_PROGRESS', 'WAITING_FOR_USER', 'RESOLVED', 'CLOSED'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-primary text-white'
                : 'bg-section border border-divider text-text-muted hover:text-text-primary'
            }`}
          >
            {status === 'ALL' ? 'Tous' : translateStatus(status)}
            {status !== 'ALL' && (
              <span className="ml-1.5 opacity-70">
                ({tickets.filter(t => t.status === status).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tickets Table */}
      <div className="mx-auto mt-6 max-w-7xl overflow-hidden rounded-xl border border-divider bg-section">
        <table className="w-full text-left">
          <thead className="bg-body border-b border-divider">
            <tr>
              <th className="px-4 py-3 text-xs font-medium text-text-muted uppercase">Ticket</th>
              <th className="px-4 py-3 text-xs font-medium text-text-muted uppercase">Auteur</th>
              <th className="px-4 py-3 text-xs font-medium text-text-muted uppercase">Catégorie</th>
              <th className="px-4 py-3 text-xs font-medium text-text-muted uppercase">Statut</th>
              <th className="px-4 py-3 text-xs font-medium text-text-muted uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-text-muted">Aucun ticket trouvé.</td>
              </tr>
            ) : (
              filteredTickets.map(ticket => (
                <tr key={ticket.id} className="border-b border-divider last:border-0 hover:bg-body/50 transition-colors">
                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigate(`/support/tickets/${ticket.id}`)}
                      className="text-primary hover:underline font-medium text-left"
                    >
                      <div className="flex items-center gap-2">
                        {priorityIcon(ticket.priority)}
                        {ticket.subject}
                      </div>
                      <div className="text-xs text-text-muted mt-0.5">#{ticket.id.substring(0,8)}</div>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-text-primary text-sm">{ticket.authorName}</td>
                  <td className="px-4 py-3 text-text-muted text-sm">{ticket.category}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(ticket.status)}`}>
                      {translateStatus(ticket.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={ticket.status}
                      onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                      className="bg-body border border-divider rounded px-2 py-1 text-xs text-text-primary focus:outline-none focus:border-primary"
                    >
                      <option value="OPEN">Ouvert</option>
                      <option value="IN_PROGRESS">En cours</option>
                      <option value="WAITING_FOR_USER">Attente client</option>
                      <option value="RESOLVED">Résolu</option>
                      <option value="CLOSED">Fermé</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Reset Identity Limit Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-section rounded-xl border border-divider p-6 max-w-lg w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-500/10 p-2 rounded-full">
                <Unlock className="w-6 h-6 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-text-primary">Réinitialiser la limite de changement d'identité</h2>
            </div>

            <p className="text-text-muted text-sm mb-6">
              Cette action va permettre à l'utilisateur ciblé de changer immédiatement son téléphone ou son email, 
              sans attendre la période de 3 mois. Cette action est tracée dans le journal d'audit.
            </p>

            {resetSuccess ? (
              <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-500 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                {resetSuccess}
              </div>
            ) : (
              <form onSubmit={handleResetLimit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">ID de l'utilisateur cible *</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-body border border-divider rounded-lg px-4 py-2 text-text-primary focus:border-primary focus:outline-none font-mono text-sm"
                    value={resetUserId}
                    onChange={e => setResetUserId(e.target.value)}
                    placeholder="UUID de l'utilisateur"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Motif obligatoire *</label>
                  <textarea
                    required
                    rows={3}
                    className="w-full bg-body border border-divider rounded-lg px-4 py-2 text-text-primary focus:border-primary focus:outline-none resize-none"
                    value={resetReason}
                    onChange={e => setResetReason(e.target.value)}
                    placeholder="Raison du déblocage (sera enregistrée dans l'audit)..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Ticket associé (optionnel)</label>
                  <input
                    type="text"
                    className="w-full bg-body border border-divider rounded-lg px-4 py-2 text-text-primary focus:border-primary focus:outline-none font-mono text-sm"
                    value={resetTicketId}
                    onChange={e => setResetTicketId(e.target.value)}
                    placeholder="UUID du ticket lié"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowResetModal(false)}
                    className="px-4 py-2 text-text-muted hover:text-text-primary transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {resetLoading ? 'Traitement...' : 'Confirmer le déblocage'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
