import { useState } from 'react';
import { Search, CreditCard, CheckCircle, X } from 'lucide-react';
import supportService from '../services/supportService';

const statusLabels = {
  TRIAL: 'Essai gratuit',
  TRIAL_ENDING: 'Essai bientôt fini',
  ACTIVE: 'Actif',
  PAST_DUE: 'Paiement en retard',
  EXPIRED: 'Expiré',
  AUCUN_ABONNEMENT: 'Aucun abonnement'
};

const statusColor = (status) => {
  switch (status) {
    case 'ACTIVE': return 'text-green-600 bg-green-500/10';
    case 'TRIAL': return 'text-blue-600 bg-blue-500/10';
    case 'TRIAL_ENDING': return 'text-yellow-600 bg-yellow-500/10';
    case 'PAST_DUE': return 'text-orange-600 bg-orange-500/10';
    case 'EXPIRED': return 'text-red-600 bg-red-500/10';
    default: return 'text-gray-500 bg-gray-400/10';
  }
};

export default function ManualSubscriptionActivationModal({ onClose }) {
  const [identifier, setIdentifier] = useState('');
  const [searching, setSearching] = useState(false);
  const [person, setPerson] = useState(null);
  const [error, setError] = useState('');

  const [selectedShopId, setSelectedShopId] = useState('');
  const [reason, setReason] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [amount, setAmount] = useState('');
  const [ticketId, setTicketId] = useState('');

  const [activating, setActivating] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) return;
    setError('');
    setPerson(null);
    setSelectedShopId('');
    try {
      setSearching(true);
      const data = await supportService.findPersonWithShops(identifier.trim());
      setPerson(data);
      if (data.shops.length === 1) {
        setSelectedShopId(data.shops[0].shopId);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Utilisateur introuvable');
    } finally {
      setSearching(false);
    }
  };

  const handleActivate = async (e) => {
    e.preventDefault();
    if (!selectedShopId || !reason.trim() || !paymentReference.trim() || !amount) return;
    setError('');
    try {
      setActivating(true);
      await supportService.activateSubscriptionManually(selectedShopId, {
        reason: reason.trim(),
        paymentReference: paymentReference.trim(),
        amount: Number(amount),
        ticketId: ticketId.trim() || null
      });
      setSuccess('Abonnement activé avec succès. L\'action a été enregistrée dans le journal d\'audit.');
      setTimeout(() => onClose(true), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'activation de l\'abonnement');
    } finally {
      setActivating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-section rounded-xl border border-divider max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-text-primary">Activer un abonnement manuellement</h2>
          </div>
          <button onClick={() => onClose(false)} className="text-text-muted hover:text-text-primary">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 text-green-600 rounded-lg text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            {success}
          </div>
        )}

        {!success && (
          <>
            <form onSubmit={handleSearch} className="mb-5">
              <label className="block text-xs font-medium text-text-muted uppercase mb-1">
                Email ou téléphone du gérant
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="ex: 690123456 ou email@exemple.com"
                  className="flex-1 px-3 py-2 rounded-lg border border-divider bg-body text-text-primary"
                />
                <button
                  type="submit"
                  disabled={searching}
                  className="flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  <Search className="w-4 h-4" />
                  {searching ? '...' : 'Chercher'}
                </button>
              </div>
            </form>

            {person && (
              <form onSubmit={handleActivate} className="space-y-4 border-t border-divider pt-4">
                <div className="text-sm text-text-primary">
                  <p className="font-semibold">{person.name}</p>
                  <p className="text-text-muted">{person.email} · {person.phoneNumber}</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-muted uppercase mb-2">
                    Boutique à activer
                  </label>
                  {person.shops.length === 0 && (
                    <p className="text-sm text-red-500">Cet utilisateur n'a aucune boutique active.</p>
                  )}
                  <div className="space-y-2">
                    {person.shops.map((shop) => (
                      <label
                        key={shop.shopId}
                        className={`flex items-center justify-between gap-2 p-3 rounded-lg border cursor-pointer ${
                          selectedShopId === shop.shopId ? 'border-primary bg-primary/5' : 'border-divider'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="shop"
                            value={shop.shopId}
                            checked={selectedShopId === shop.shopId}
                            onChange={(e) => setSelectedShopId(e.target.value)}
                          />
                          <span className="text-sm text-text-primary">{shop.shopName}</span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(shop.subscriptionStatus)}`}>
                          {statusLabels[shop.subscriptionStatus] || shop.subscriptionStatus}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-text-muted uppercase mb-1">
                      Montant reçu (XOF)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="5000"
                      className="w-full px-3 py-2 rounded-lg border border-divider bg-body text-text-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-muted uppercase mb-1">
                      Référence Mobile Money
                    </label>
                    <input
                      type="text"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      placeholder="Réf. transaction"
                      className="w-full px-3 py-2 rounded-lg border border-divider bg-body text-text-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-muted uppercase mb-1">
                    Motif / commentaire (obligatoire)
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={2}
                    placeholder="ex: Paiement Orange Money reçu directement, CinetPay pas encore activé"
                    className="w-full px-3 py-2 rounded-lg border border-divider bg-body text-text-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-muted uppercase mb-1">
                    Ticket lié (optionnel)
                  </label>
                  <input
                    type="text"
                    value={ticketId}
                    onChange={(e) => setTicketId(e.target.value)}
                    placeholder="ID du ticket"
                    className="w-full px-3 py-2 rounded-lg border border-divider bg-body text-text-primary"
                  />
                </div>

                <button
                  type="submit"
                  disabled={activating || !selectedShopId || !reason.trim() || !paymentReference.trim() || !amount}
                  className="w-full bg-primary text-white py-2.5 rounded-lg font-medium disabled:opacity-50"
                >
                  {activating ? 'Activation en cours...' : 'Activer l\'abonnement'}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
