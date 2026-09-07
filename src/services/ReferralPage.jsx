import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Gift, Copy, Check, Users, Share2, Store, Clock } from "lucide-react";
import { getMyReferralSummary, getEligibleShopsForReward, applyReward } from "./referralService";


const dateFormatter = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "long", year: "numeric" });

function RewardChoiceModal({ reward, onClose, onApplied }) {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedShopId, setSelectedShopId] = useState("");
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getEligibleShopsForReward(reward.id)
      .then((data) => {
        setShops(data);
        if (data.length === 1) setSelectedShopId(data[0].shopId);
      })
      .catch(() => setError("Impossible de charger vos boutiques."))
      .finally(() => setLoading(false));
  }, [reward.id]);

  async function handleConfirm() {
    if (!selectedShopId) return;
    setApplying(true);
    setError("");
    try {
      await applyReward(reward.id, selectedShopId);
      onApplied();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'application de la récompense.");
    } finally {
      setApplying(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl border border-[#bdc9c1] max-w-md w-full p-6">
        <div className="flex items-center gap-2 mb-4">
          <Gift className="w-5 h-5 text-[#006547]" />
          <h2 className="text-lg font-bold text-[#141e1a]">Choisir la boutique bénéficiaire</h2>
        </div>
        <p className="text-sm text-[#6e7a72] mb-4">
          {reward.refereeName} s'est abonné(e) ! Choisissez la boutique qui recevra vos {reward.bonusDays} jours bonus.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-[#ffdad6] text-[#93000a] rounded-lg text-sm">{error}</div>
        )}

        {loading ? (
          <p className="text-sm text-[#6e7a72]">Chargement de vos boutiques...</p>
        ) : shops.length === 0 ? (
          <p className="text-sm text-[#93000a]">Aucune boutique éligible trouvée.</p>
        ) : (
          <div className="space-y-2 mb-5">
            {shops.map((shop) => (
              <label
                key={shop.shopId}
                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer ${
                  selectedShopId === shop.shopId ? "border-[#006547] bg-[#ddffea]" : "border-[#bdc9c1]"
                }`}
              >
                <input
                  type="radio"
                  name="reward-shop"
                  value={shop.shopId}
                  checked={selectedShopId === shop.shopId}
                  onChange={(e) => setSelectedShopId(e.target.value)}
                />
                <Store size={16} className="text-[#3e4943]" />
                <span className="text-sm text-[#141e1a]">{shop.shopName}</span>
              </label>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-[#6e7a72] hover:text-[#141e1a]">
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedShopId || applying}
            className="bg-[#006547] text-white px-5 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
          >
            {applying ? "Application..." : "Confirmer"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReferralPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeReward, setActiveReward] = useState(null);

  const loadSummary = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMyReferralSummary();
      setSummary(data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Impossible de charger votre parrainage pour le moment.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  function handleCopyLink() {
    if (!summary?.referralLink) return;
    navigator.clipboard.writeText(summary.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleShare() {
    if (!summary?.referralLink) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Rejoignez-moi sur Sellam",
          text: "Gérez votre boutique facilement avec Sellam. Inscrivez-vous avec mon lien :",
          url: summary.referralLink,
        });
      } catch {
        // partage annulé par l'utilisateur, rien à faire
      }
    } else {
      handleCopyLink();
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f1fcf5] flex items-center justify-center">
        <p className="text-sm text-[#6e7a72]">Chargement de votre parrainage...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1fcf5] pb-24 text-[#141e1a]">
      <div className="mx-auto max-w-3xl px-5 py-6 md:px-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#bdc9c1] bg-white text-[#3e4943] hover:bg-[#ebf6ef]">
            <ArrowLeft size={20} />
          </button>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#006547]">Compte</p>
            <h1 className="font-display text-3xl font-bold">Parrainage</h1>
            <p className="text-sm text-[#6e7a72]">Invitez d'autres commerçants et gagnez des jours d'abonnement offerts.</p>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-[#ffdad6] bg-[#ffdad6] p-4 text-sm text-[#93000a] mb-6">{error}</div>
        )}

        {summary && (
          <>
            {/* Carte lien de parrainage */}
            <div className="bg-white border border-[#bdc9c1] rounded-xl p-6 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Gift size={20} className="text-[#006547]" />
                <h3 className="text-base font-semibold">Votre lien de parrainage</h3>
              </div>
              <p className="text-sm text-[#6e7a72] mb-4">
                Partagez ce lien : quand un filleul devient abonné payant, vous recevez des jours
                bonus sur l'abonnement de la boutique de votre choix.
              </p>

              <div className="bg-[#ebf6ef] border border-[#bdc9c1] rounded-lg p-3 mb-3">
                <p className="text-xs font-bold uppercase tracking-wider text-[#3e4943] mb-1">Code</p>
                <p className="text-lg font-bold font-mono text-[#006547]">{summary.referralCode}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCopyLink}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-[#bdc9c1] bg-white px-4 py-2.5 text-sm font-medium text-[#3e4943] hover:bg-[#ebf6ef]"
                >
                  {copied ? <Check size={16} className="text-[#006547]" /> : <Copy size={16} />}
                  {copied ? "Lien copié" : "Copier le lien"}
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-[#006547] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#12805c]"
                >
                  <Share2 size={16} />
                  Partager
                </button>
              </div>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white border border-[#bdc9c1] rounded-xl p-4 text-center">
                <Users size={22} className="text-[#006547] mx-auto mb-1" />
                <p className="text-2xl font-bold">{summary.totalReferred}</p>
                <p className="text-xs text-[#6e7a72]">Filleul{summary.totalReferred > 1 ? "s" : ""} au total</p>
              </div>
              <div className="bg-white border border-[#bdc9c1] rounded-xl p-4 text-center">
                <Gift size={22} className="text-[#006547] mx-auto mb-1" />
                <p className="text-2xl font-bold">{summary.totalRewarded}</p>
                <p className="text-xs text-[#6e7a72]">Récompense{summary.totalRewarded > 1 ? "s" : ""} obtenue{summary.totalRewarded > 1 ? "s" : ""}</p>
              </div>
            </div>

            {/* Récompenses en attente de choix */}
            {summary.pendingRewards?.length > 0 && (
              <div className="bg-white border border-[#ffddb9] rounded-xl p-6 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock size={18} className="text-[#663e00]" />
                  <h3 className="text-base font-semibold">Récompenses en attente de votre choix</h3>
                </div>
                <div className="space-y-3">
                  {summary.pendingRewards.map((reward) => (
                    <div key={reward.id} className="flex items-center justify-between gap-3 border-t border-[#ebf6ef] pt-3 first:border-0 first:pt-0">
                      <div>
                        <p className="text-sm font-medium text-[#141e1a]">{reward.refereeName}</p>
                        <p className="text-xs text-[#6e7a72]">{reward.bonusDays} jours bonus à attribuer</p>
                      </div>
                      <button
                        onClick={() => setActiveReward(reward)}
                        className="text-sm font-semibold text-[#006547] hover:underline shrink-0"
                      >
                        Choisir la boutique
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Historique des récompenses appliquées */}
            {summary.appliedRewards?.length > 0 && (
              <div className="bg-white border border-[#bdc9c1] rounded-xl p-6">
                <h3 className="text-base font-semibold mb-3">Historique</h3>
                <div className="space-y-3">
                  {summary.appliedRewards.map((reward) => (
                    <div key={reward.id} className="flex items-center justify-between gap-3 border-t border-[#ebf6ef] pt-3 first:border-0 first:pt-0">
                      <div>
                        <p className="text-sm font-medium text-[#141e1a]">{reward.refereeName}</p>
                        <p className="text-xs text-[#6e7a72]">
                          {reward.bonusDays} jours offerts à {reward.appliedToShopName}
                          {reward.appliedAt ? ` · ${dateFormatter.format(new Date(reward.appliedAt))}` : ""}
                        </p>
                      </div>
                      <Check size={18} className="text-[#006547] shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {summary.totalReferred === 0 && (
              <div className="bg-white border border-[#bdc9c1] rounded-xl p-6 text-center">
                <Users size={32} className="text-[#bdc9c1] mx-auto mb-2" />
                <p className="text-sm text-[#6e7a72]">
                  Vous n'avez encore parrainé personne. Partagez votre lien pour commencer à gagner des jours bonus !
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {activeReward && (
        <RewardChoiceModal
          reward={activeReward}
          onClose={() => setActiveReward(null)}
          onApplied={() => {
            setActiveReward(null);
            loadSummary();
          }}
        />
      )}

      
    </div>
  );
}
