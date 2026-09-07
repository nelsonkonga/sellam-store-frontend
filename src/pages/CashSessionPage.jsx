import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import { listRegisters, getSessionDetail, openSession, closeSession, regularizeSession, addMovement } from "../services/cashService";
import { ArrowLeft } from "lucide-react";

const currencyFormatter = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XAF", maximumFractionDigits: 0 });
const dateFormatter = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default function CashSessionPage() {
  const { registerId } = useParams();
  const navigate = useNavigate();
  const { selectedShopId: shopId } = useShop();

  const [registers, setRegisters] = useState([]);
  const [selectedRegister, setSelectedRegister] = useState(null);
  const [session, setSession] = useState(null);
  const [currentBalance, setCurrentBalance] = useState(null);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal states
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showRegularizeModal, setShowRegularizeModal] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);

  // Form states
  const [openingCash, setOpeningCash] = useState("");
  const [closingDeclared, setClosingDeclared] = useState("");
  const [regularizeActual, setRegularizeActual] = useState("");
  const [movementType, setMovementType] = useState("IN");
  const [movementAmount, setMovementAmount] = useState("");
  const [movementReason, setMovementReason] = useState("");

  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!shopId) {
      navigate("/shops");
      return;
    }
    loadData();
  }, [shopId, registerId, navigate]);

  async function loadData() {
    try {
      setLoading(true);
      setError("");
      const registerData = await listRegisters(shopId);
      setRegisters(registerData || []);

      if (registerId) {
        const register = registerData.find(r => r.id === registerId);
        setSelectedRegister(register || null);

        if (!register) {
          setSession(null);
          setMovements([]);
          setError("Caisse introuvable.");
          return;
        }

        // IMPORTANT : getSessionDetail attend un sessionId, pas un registerId.
        // registerId (depuis l'URL /cash/:registerId) identifie la caisse physique,
        // qui peut avoir eu plusieurs sessions dans le temps. On ne peut demander le
        // détail que de la session ACTIVE de cette caisse, via register.activeSession.id.
        if (register.activeSession) {
          const sessionData = await getSessionDetail(register.activeSession.id);
          setSession(sessionData.session);
          setMovements(sessionData.movements || []);
          setCurrentBalance(sessionData.currentBalance);
        } else {
          // Pas de session active sur cette caisse : état normal, pas une erreur.
          setSession(null);
          setMovements([]);
          setCurrentBalance(null);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Impossible de charger la session.");
    } finally {
      setLoading(false);
    }
  }

  async function handleOpenSession() {
    const amount = parseFloat(openingCash);
    if (isNaN(amount) || amount < 0) {
      setError("Montant invalide");
      return;
    }
    setActionLoading(true);
    try {
      await openSession(registerId, { openingCashAmount: amount });
      setShowOpenModal(false);
      setOpeningCash("");
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'ouverture");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCloseSession() {
    const amount = parseFloat(closingDeclared);
    if (isNaN(amount) || amount < 0) {
      setError("Montant invalide");
      return;
    }
    setActionLoading(true);
    try {
      await closeSession(session.id, { closingDeclaredAmount: amount });
      setShowCloseModal(false);
      setClosingDeclared("");
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la clôture");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRegularize() {
    const amount = parseFloat(regularizeActual);
    if (isNaN(amount) || amount < 0) {
      setError("Montant invalide");
      return;
    }
    setActionLoading(true);
    try {
      await regularizeSession(session.id, { actualOpeningCashAmount: amount });
      setShowRegularizeModal(false);
      setRegularizeActual("");
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la régularisation");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleAddMovement() {
    const amount = parseFloat(movementAmount);
    if (isNaN(amount) || amount <= 0) {
      setError("Montant invalide");
      return;
    }
    if (!movementReason.trim()) {
      setError("Motif requis");
      return;
    }
    setActionLoading(true);
    try {
      await addMovement(session.id, { type: movementType, amount, reason: movementReason });
      setShowMovementModal(false);
      setMovementAmount("");
      setMovementReason("");
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'ajout");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f1fcf5] pb-24 text-[#141e1a]">
        <div className="mx-auto max-w-7xl px-5 py-2 md:px-8 lg:px-10">
          <p className="text-center text-sm text-[#6e7a72] py-10">Chargement...</p>
        </div>
        
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1fcf5] pb-24 text-[#141e1a]">
      <div className="mx-auto max-w-7xl px-5 py-2 md:px-8 lg:px-10">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate("/cash")} className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#bdc9c1] bg-white text-[#3e4943] hover:bg-[#ebf6ef]">
            <ArrowLeft size={20} />
          </button>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#006547]">Trésorerie</p>
            <h1 className="font-display text-3xl font-bold">Session de Caisse</h1>
            <p className="text-sm text-[#6e7a72]">{selectedRegister?.label || "Caisse inconnue"}</p>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-[#ffdad6] bg-[#ffdad6] p-4 text-sm text-[#93000a] mb-6">
            {error}
          </div>
        )}

        {!session ? (
          <div className="bg-white border border-[#bdc9c1] rounded-xl p-8 text-center">
            <p className="text-[#6e7a72] mb-4">Aucune session active</p>
            <button
              onClick={() => setShowOpenModal(true)}
              className="bg-[#006547] text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-[#12805c]"
            >
              Ouvrir une session
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Financial Summary */}
              <div className="bg-white border border-[#bdc9c1] rounded-xl p-6">
                <h2 className="font-display text-lg font-semibold text-[#141e1a] mb-4">Résumé Financier</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-[#ebf6ef] rounded-lg">
                    <span className="text-sm text-[#3e4943]">Montant d'ouverture</span>
                    <span className="font-mono text-[#141e1a]">{currencyFormatter.format(session.openingCashAmount || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-[#ebf6ef] rounded-lg">
                    <span className="text-sm text-[#3e4943]">Montant attendu (en direct)</span>
                    {/* currentBalance = openingCashAmount + mouvements nets de la session, recalculé
                        à chaque chargement. C'est le seul montant "attendu" fiable pour une session
                        encore ouverte : contrairement à discrepancy, il ne dépend pas d'une clôture. */}
                    <span className="font-mono text-[#141e1a]">{currencyFormatter.format(currentBalance || 0)}</span>
                  </div>
                  {session.status === "CLOSED" && session.discrepancy !== null && session.discrepancy !== undefined && (
                    <div className="flex justify-between items-center p-3 bg-[#ebf6ef] rounded-lg">
                      <span className="text-sm text-[#3e4943]">Écart constaté à la clôture</span>
                      <span className={`font-mono ${Number(session.discrepancy) < 0 ? "text-[#ba1a1a]" : Number(session.discrepancy) > 0 ? "text-[#9f6300]" : "text-[#006547]"}`}>
                        {Number(session.discrepancy) >= 0 ? "+" : ""}{currencyFormatter.format(session.discrepancy || 0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  {session.status === "OPEN" && (
                    <button
                      onClick={() => setShowCloseModal(true)}
                      className="flex-1 bg-[#006547] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#12805c]"
                    >
                      Clôturer Session
                    </button>
                  )}
                  {session.status === "PENDING_INITIAL_CASH" && (
                    <button
                      onClick={() => setShowRegularizeModal(true)}
                      className="flex-1 bg-[#006547] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#12805c]"
                    >
                      Régulariser
                    </button>
                  )}
                  <button
                    onClick={() => setShowMovementModal(true)}
                    className="flex-1 border border-[#bdc9c1] text-[#141e1a] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#ebf6ef]"
                  >
                    + Mouvement
                  </button>
                </div>
              </div>

              {/* Movement Journal */}
              <div className="bg-white border border-[#bdc9c1] rounded-xl p-6">
                <h2 className="font-display text-lg font-semibold text-[#141e1a] mb-4">Journal des Mouvements</h2>
                {movements.length === 0 ? (
                  <p className="text-sm text-[#6e7a72]">Aucun mouvement enregistré</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {movements.map((movement, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-[#ebf6ef] rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-[#141e1a]">{movement.reason}</p>
                          <p className="text-xs text-[#3e4943]">{dateFormatter.format(new Date(movement.timestamp))}</p>
                        </div>
                        <span className={`font-mono text-sm ${movement.type === "VENTE_CASH" ? "text-[#006547]" : "text-[#ba1a1a]"}`}>
                          {movement.type === "VENTE_CASH" ? "+" : "-"}{currencyFormatter.format(movement.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Modals */}
        {showOpenModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold text-[#141e1a] mb-4">Ouvrir Session</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#3e4943] mb-2">Montant d'ouverture</label>
                <input
                  type="number"
                  value={openingCash}
                  onChange={(e) => setOpeningCash(e.target.value)}
                  className="w-full border border-[#bdc9c1] rounded-lg p-3 text-[#141e1a] focus:border-[#006547] focus:ring-1 focus:ring-[#006547] outline-none"
                  placeholder="Montant en FCFA"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowOpenModal(false)} className="px-4 py-2 border border-[#bdc9c1] text-[#141e1a] rounded-lg text-sm font-semibold hover:bg-[#ebf6ef]">Annuler</button>
                <button onClick={handleOpenSession} disabled={actionLoading} className="px-4 py-2 bg-[#006547] text-white rounded-lg text-sm font-semibold hover:bg-[#12805c] disabled:opacity-50">{actionLoading ? "..." : "Ouvrir"}</button>
              </div>
            </div>
          </div>
        )}

        {showCloseModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold text-[#141e1a] mb-4">Clôturer Session</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#3e4943] mb-2">Montant déclaré</label>
                <input
                  type="number"
                  value={closingDeclared}
                  onChange={(e) => setClosingDeclared(e.target.value)}
                  className="w-full border border-[#bdc9c1] rounded-lg p-3 text-[#141e1a] focus:border-[#006547] focus:ring-1 focus:ring-[#006547] outline-none"
                  placeholder="Montant en FCFA"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowCloseModal(false)} className="px-4 py-2 border border-[#bdc9c1] text-[#141e1a] rounded-lg text-sm font-semibold hover:bg-[#ebf6ef]">Annuler</button>
                <button onClick={handleCloseSession} disabled={actionLoading} className="px-4 py-2 bg-[#006547] text-white rounded-lg text-sm font-semibold hover:bg-[#12805c] disabled:opacity-50">{actionLoading ? "..." : "Clôturer"}</button>
              </div>
            </div>
          </div>
        )}

        {showRegularizeModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold text-[#141e1a] mb-4">Régulariser Session</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#3e4943] mb-2">Montant réel d'ouverture</label>
                <input
                  type="number"
                  value={regularizeActual}
                  onChange={(e) => setRegularizeActual(e.target.value)}
                  className="w-full border border-[#bdc9c1] rounded-lg p-3 text-[#141e1a] focus:border-[#006547] focus:ring-1 focus:ring-[#006547] outline-none"
                  placeholder="Montant en FCFA"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowRegularizeModal(false)} className="px-4 py-2 border border-[#bdc9c1] text-[#141e1a] rounded-lg text-sm font-semibold hover:bg-[#ebf6ef]">Annuler</button>
                <button onClick={handleRegularize} disabled={actionLoading} className="px-4 py-2 bg-[#006547] text-white rounded-lg text-sm font-semibold hover:bg-[#12805c] disabled:opacity-50">{actionLoading ? "..." : "Régulariser"}</button>
              </div>
            </div>
          </div>
        )}

        {showMovementModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold text-[#141e1a] mb-4">Ajouter Mouvement</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#3e4943] mb-2">Type</label>
                  <select
                    value={movementType}
                    onChange={(e) => setMovementType(e.target.value)}
                    className="w-full border border-[#bdc9c1] rounded-lg p-3 text-[#141e1a] focus:border-[#006547] focus:ring-1 focus:ring-[#006547] outline-none"
                  >
                    <option value="VENTE_CASH">Vente Cash</option>
                    <option value="REMBOURSEMENT">Remboursement</option>
                    <option value="DEPENSE">Dépense</option>
                    <option value="RETRAIT">Retrait</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3e4943] mb-2">Montant</label>
                  <input
                    type="number"
                    value={movementAmount}
                    onChange={(e) => setMovementAmount(e.target.value)}
                    className="w-full border border-[#bdc9c1] rounded-lg p-3 text-[#141e1a] focus:border-[#006547] focus:ring-1 focus:ring-[#006547] outline-none"
                    placeholder="Montant en FCFA"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3e4943] mb-2">Motif</label>
                  <input
                    type="text"
                    value={movementReason}
                    onChange={(e) => setMovementReason(e.target.value)}
                    className="w-full border border-[#bdc9c1] rounded-lg p-3 text-[#141e1a] focus:border-[#006547] focus:ring-1 focus:ring-[#006547] outline-none"
                    placeholder="Raison du mouvement"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setShowMovementModal(false)} className="px-4 py-2 border border-[#bdc9c1] text-[#141e1a] rounded-lg text-sm font-semibold hover:bg-[#ebf6ef]">Annuler</button>
                  <button onClick={handleAddMovement} disabled={actionLoading} className="px-4 py-2 bg-[#006547] text-white rounded-lg text-sm font-semibold hover:bg-[#12805c] disabled:opacity-50">{actionLoading ? "..." : "Ajouter"}</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      
    </div>
  );
}