import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import { listRegisters, getCashStatus, createRegister } from "../services/cashService";
import { ArrowLeft, Store } from "lucide-react";

const currencyFormatter = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XAF", maximumFractionDigits: 0 });

export default function CashRegistersPage() {
  const navigate = useNavigate();
  const { selectedShopId: shopId, selectedShopName } = useShop();
  const [registers, setRegisters] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [creating, setCreating] = useState(false);

  const loadData = async () => {
    if (!shopId) {
      navigate("/shops");
      return;
    }

    try {
      setLoading(true);
      const [registerData, statusData] = await Promise.all([
        listRegisters(shopId),
        getCashStatus(shopId),
      ]);
      setRegisters(registerData || []);
      setStatus(statusData || {});
      setError("");
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Session expirée. Veuillez vous reconnecter.");
        return;
      }
      setError(err.response?.data?.message || "Impossible de charger les caisses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [shopId, navigate]);

  async function handleCreateRegister() {
    if (!newLabel.trim()) {
      setError("Veuillez entrer un nom pour la caisse.");
      return;
    }
    setCreating(true);
    setError("");
    try {
      await createRegister(shopId, { label: newLabel });
      setShowCreateModal(false);
      setNewLabel("");
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Impossible de créer la caisse.");
    } finally {
      setCreating(false);
    }
  }

  function getStatusBadge(status) {
    if (!status) return <span className="px-2 py-1 rounded-[4px] bg-[#bdc9c1] text-[#3e4943] text-[10px] font-bold uppercase tracking-wider">Inconnu</span>;
    
    switch (status) {
      case "OPEN":
        return <span className="px-2 py-1 rounded-[4px] bg-[#DDF4EA] text-[#005138] text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#95f6ca]"></span>Ouverte</span>;
      case "CLOSED":
        return <span className="px-2 py-1 rounded-[4px] bg-[#bdc9c1] text-[#3e4943] text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#bdc9c1]"></span>Fermée</span>;
      case "PENDING_INITIAL_CASH":
        return <span className="px-2 py-1 rounded-[4px] bg-[#ffddb9] text-[#663e00] text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#ffb962]"></span>En attente de solde initial</span>;
      default:
        return <span className="px-2 py-1 rounded-[4px] bg-[#bdc9c1] text-[#3e4943] text-[10px] font-bold uppercase tracking-wider">{status}</span>;
    }
  }

  return (
    <div className="min-h-screen bg-[#f1fcf5] pb-24 text-[#141e1a]">
      <div className="mx-auto max-w-7xl px-5 py-2 md:px-8 lg:px-10">
        <div className="sticky top-0 z-10 mb-6 flex flex-wrap items-center gap-3 bg-[#f1fcf5]/95 py-2 backdrop-blur-sm">
          <button onClick={() => navigate("/dashboard")} className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#bdc9c1] bg-white text-[#3e4943] hover:bg-[#ebf6ef]">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#006547]">Trésorerie</p>
            <h1 className="font-display text-3xl font-bold">Gestion des Caisses</h1>
            <p className="text-sm text-[#6e7a72]">Vue d'ensemble et contrôle des points de vente.</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="shrink-0 rounded-lg bg-[#006547] px-4 py-2 text-sm font-semibold text-white hover:bg-[#12805c]"
          >
            + Créer une caisse
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-[#ffdad6] bg-[#ffdad6] p-4 text-sm text-[#93000a] mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-center text-sm text-[#6e7a72] py-10">Chargement des caisses...</p>
        ) : (
          <>

            {/* Dashboard Grid (Bento style) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Summary Card - Caisses Actives */}
              <div className="bg-white border border-[#DCE4DE] rounded-xl p-4 flex flex-col justify-between h-32">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#3e4943]">Caisses Actives</span>
                  <Store size={20} />
                </div>
                <div className="text-3xl font-medium text-[#141e1a]">
                  {registers.filter(r => r.activeSession).length} <span className="text-base text-[#3e4943] font-normal"> / {registers.length}</span>
                </div>
              </div>
            </div>

            {/* Data Table Section (List of Registers) */}
            <div className="bg-white border border-[#DCE4DE] rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#bdc9c1] bg-[#ffffff]">
                      <th className="text-xs font-bold uppercase tracking-wider text-[#3e4943] p-4 font-semibold w-1/4">Caisse & Emplacement</th>
                      <th className="text-xs font-bold uppercase tracking-wider text-[#3e4943] p-4 font-semibold w-1/6">Statut</th>
                      <th className="text-xs font-bold uppercase tracking-wider text-[#3e4943] p-4 font-semibold w-1/5">Responsable</th>
                      <th className="text-xs font-bold uppercase tracking-wider text-[#3e4943] p-4 font-semibold text-right w-1/5">Montant Attendu</th>
                      <th className="text-xs font-bold uppercase tracking-wider text-[#3e4943] p-4 font-semibold text-right w-1/6">Écart Hist.</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {registers.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-8 text-center text-[#6e7a72]">Aucune caisse configurée. Créez votre première caisse pour commencer.</td>
                      </tr>
                    ) : (
                      registers.map((register) => (
                        <tr 
                          key={register.id} 
                          className="border-b border-[#bdc9c1] hover:bg-[#ebf6ef] transition-colors cursor-pointer"
                          onClick={() => navigate(`/cash/${register.id}`)}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-[#ebf6ef] flex items-center justify-center text-[#3e4943]">
                                <Store size={20} />
                              </div>
                              <div>
                                <div className="font-medium text-[#141e1a]">{register.label}</div>
                                <div className="text-xs text-[#3e4943]">{selectedShopName || "Boutique"}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            {register.activeSession ? getStatusBadge(register.activeSession.status) : getStatusBadge(null)}
                          </td>
                          <td className="p-4 text-[#141e1a]">
                            {register.activeSession ? register.activeSession.openedByName : "Non assigné"}
                          </td>
                          <td className="p-4 text-right font-mono text-[#141e1a]">
                            {register.activeSession ? currencyFormatter.format(register.activeSession.openingCashAmount || 0) : "---"}
                          </td>
                          <td className="p-4 text-right font-mono text-[#3e4943]">
                            ---
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Create Register Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-[#141e1a] mb-4">Créer une nouvelle caisse</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#3e4943] mb-2">Nom de la caisse</label>
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="w-full border border-[#bdc9c1] rounded-lg p-3 text-[#141e1a] focus:border-[#006547] focus:ring-1 focus:ring-[#006547] outline-none"
                placeholder="Ex: Caisse Principale"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewLabel("");
                  setError("");
                }}
                className="px-4 py-2 border border-[#bdc9c1] text-[#141e1a] rounded-lg text-sm font-semibold hover:bg-[#ebf6ef] transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateRegister}
                disabled={creating}
                className="px-4 py-2 bg-[#006547] text-white rounded-lg text-sm font-semibold hover:bg-[#12805c] transition-colors disabled:opacity-50"
              >
                {creating ? "Création..." : "Créer"}
              </button>
            </div>
          </div>
        </div>
      )}

      
    </div>
  );
}
