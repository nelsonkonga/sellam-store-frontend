import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import { listSessions } from "../services/cashService";


const currencyFormatter = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XAF", maximumFractionDigits: 0 });
const dateFormatter = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default function CashHistoryPage() {
  const navigate = useNavigate();
  const { selectedShopId: shopId } = useShop();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filterDate, setFilterDate] = useState("");
  const [filterRegister, setFilterRegister] = useState("");
  const [filterManager, setFilterManager] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    if (!shopId) {
      navigate("/shops");
      return;
    }
    async function fetchSessions() {
      try {
        const data = await listSessions(shopId);
        setSessions(data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Impossible de charger l'historique.");
      } finally {
        setLoading(false);
      }
    }
    fetchSessions();
  }, [shopId, navigate]);

  const filteredSessions = sessions.filter(session => {
    if (filterDate && session.openedAt && !session.openedAt.includes(filterDate)) return false;
    if (filterRegister && session.registerLabel && !session.registerLabel.toLowerCase().includes(filterRegister.toLowerCase())) return false;
    if (filterManager && session.openedByName && !session.openedByName.toLowerCase().includes(filterManager.toLowerCase())) return false;
    if (filterStatus && session.status !== filterStatus) return false;
    return true;
  });

  function getStatusBadge(status) {
    switch (status) {
      case "OPEN":
        return <span className="px-2 py-1 rounded-[4px] bg-[#DDF4EA] text-[#005138] text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#95f6ca]"></span>Ouverte</span>;
      case "CLOSED":
        return <span className="px-2 py-1 rounded-[4px] bg-[#bdc9c1] text-[#3e4943] text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#bdc9c1]"></span>Fermée</span>;
      case "PENDING_INITIAL_CASH":
        return <span className="px-2 py-1 rounded-[4px] bg-[#ffddb9] text-[#663e00] text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#ffb962]"></span>En attente</span>;
      default:
        return <span className="px-2 py-1 rounded-[4px] bg-[#bdc9c1] text-[#3e4943] text-[10px] font-bold uppercase tracking-wider">{status}</span>;
    }
  }

  return (
    <div className="min-h-screen bg-[#f1fcf5] pb-24 text-[#141e1a]">
      <div className="mx-auto max-w-7xl px-5 py-2 md:px-8 lg:px-10">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate("/cash")} className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#bdc9c1] bg-white text-[#3e4943] hover:bg-[#ebf6ef]">
            <span className="text-xl">arrow_back</span>
          </button>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#006547]">Trésorerie</p>
            <h1 className="font-display text-3xl font-bold">Historique des Sessions</h1>
            <p className="text-sm text-[#6e7a72]">Consultez l'historique complet des sessions de caisse.</p>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-[#ffdad6] bg-[#ffdad6] p-4 text-sm text-[#93000a] mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-center text-sm text-[#6e7a72] py-10">Chargement de l'historique...</p>
        ) : (
          <>
            <div className="flex justify-between items-end mb-6">
              <div className="flex gap-2">
                <button className="border border-[#bdc9c1] bg-[#f1fcf5] text-[#141e1a] text-sm py-1 px-3 rounded-lg flex items-center gap-1 hover:bg-[#ebf6ef] shadow-sm transition-colors">
                  <span className="text-lg">download</span>
                  Export CSV
                </button>
                <button className="border border-[#bdc9c1] bg-[#f1fcf5] text-[#141e1a] text-sm py-1 px-3 rounded-lg flex items-center gap-1 hover:bg-[#ebf6ef] shadow-sm transition-colors">
                  <span className="text-lg">print</span>
                  Imprimer
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-[#f1fcf5] border border-[#bdc9c1] rounded-xl p-2 flex flex-wrap items-center gap-2 shadow-sm mb-6">
              <div className="relative flex-1 min-w-[200px]">
                <span className="text-xl absolute left-4 top-1/2 -translate-y-1/2 text-[#bdc9c1]">calendar_today</span>
                <input 
                  className="w-full pl-10 pr-3 py-2 bg-[#f1fcf5] border border-[#bdc9c1] rounded-md text-sm text-[#141e1a] focus:border-[#006547] focus:ring-1 focus:ring-[#006547] h-9" 
                  type="date" 
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                />
              </div>
              <div className="relative flex-1 min-w-[150px]">
                <select 
                  className="w-full pl-3 pr-10 py-2 bg-[#f1fcf5] border border-[#bdc9c1] rounded-md text-sm text-[#141e1a] focus:border-[#006547] focus:ring-1 focus:ring-[#006547] h-9 appearance-none"
                  value={filterRegister}
                  onChange={(e) => setFilterRegister(e.target.value)}
                >
                  <option value="">Toutes les caisses</option>
                  {[...new Set(sessions.map(s => s.registerLabel))].map(label => (
                    <option key={label} value={label}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="relative flex-1 min-w-[150px]">
                <select 
                  className="w-full pl-3 pr-10 py-2 bg-[#f1fcf5] border border-[#bdc9c1] rounded-md text-sm text-[#141e1a] focus:border-[#006547] focus:ring-1 focus:ring-[#006547] h-9 appearance-none"
                  value={filterManager}
                  onChange={(e) => setFilterManager(e.target.value)}
                >
                  <option value="">Tous les managers</option>
                  {[...new Set(sessions.map(s => s.openedByName))].map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
              <div className="relative flex-1 min-w-[120px]">
                <select 
                  className="w-full pl-3 pr-10 py-2 bg-[#f1fcf5] border border-[#bdc9c1] rounded-md text-sm text-[#141e1a] focus:border-[#006547] focus:ring-1 focus:ring-[#006547] h-9 appearance-none"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="">Tous les statuts</option>
                  <option value="OPEN">Ouverte</option>
                  <option value="CLOSED">Fermée</option>
                  <option value="PENDING_INITIAL_CASH">En attente</option>
                </select>
              </div>
            </div>

            {/* Sessions Table */}
            <div className="bg-white border border-[#bdc9c1] rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#bdc9c1] bg-[#ffffff]">
                      <th className="text-xs font-bold uppercase tracking-wider text-[#3e4943] p-4 font-semibold">Date</th>
                      <th className="text-xs font-bold uppercase tracking-wider text-[#3e4943] p-4 font-semibold">Caisse</th>
                      <th className="text-xs font-bold uppercase tracking-wider text-[#3e4943] p-4 font-semibold">Manager</th>
                      <th className="text-xs font-bold uppercase tracking-wider text-[#3e4943] p-4 font-semibold">Statut</th>
                      <th className="text-xs font-bold uppercase tracking-wider text-[#3e4943] p-4 font-semibold text-right">Ouverture</th>
                      <th className="text-xs font-bold uppercase tracking-wider text-[#3e4943] p-4 font-semibold text-right">Déclaration</th>
                      <th className="text-xs font-bold uppercase tracking-wider text-[#3e4943] p-4 font-semibold text-right">Écart</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {filteredSessions.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="p-8 text-center text-[#6e7a72]">Aucune session trouvée</td>
                      </tr>
                    ) : (
                      filteredSessions.map((session) => (
                        <tr 
                          key={session.id} 
                          className="border-b border-[#bdc9c1] hover:bg-[#ebf6ef] transition-colors cursor-pointer"
                          onClick={() => navigate(`/cash/${session.registerId}`)}
                        >
                          <td className="p-4">
                            {session.openedAt ? dateFormatter.format(new Date(session.openedAt)) : "---"}
                          </td>
                          <td className="p-4 text-[#141e1a]">{session.registerLabel || "---"}</td>
                          <td className="p-4 text-[#141e1a]">{session.openedByName || "---"}</td>
                          <td className="p-4">{getStatusBadge(session.status)}</td>
                          <td className="p-4 text-right font-mono text-[#141e1a]">
                            {currencyFormatter.format(session.openingCashAmount || 0)}
                          </td>
                          <td className="p-4 text-right font-mono text-[#141e1a]">
                            {session.closingDeclaredAmount ? currencyFormatter.format(session.closingDeclaredAmount) : "---"}
                          </td>
                          <td className="p-4 text-right font-mono">
                            <span className={session.discrepancy < 0 ? "text-[#ba1a1a]" : session.discrepancy > 0 ? "text-[#9f6300]" : "text-[#006547]"}>
                              {session.discrepancy >= 0 ? "+" : ""}{currencyFormatter.format(session.discrepancy || 0)}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-[#6e7a72]">Affichage de 1 à {Math.min(10, filteredSessions.length)} sur {filteredSessions.length} sessions</p>
              <div className="flex gap-2">
                <button className="px-3 py-1 border border-[#bdc9c1] bg-white text-[#141e1a] rounded text-sm hover:bg-[#ebf6ef] disabled:opacity-50" disabled>Précédent</button>
                <button className="px-3 py-1 border border-[#bdc9c1] bg-white text-[#141e1a] rounded text-sm hover:bg-[#ebf6ef] disabled:opacity-50" disabled>Suivant</button>
              </div>
            </div>
          </>
        )}
      </div>

      
    </div>
  );
}
