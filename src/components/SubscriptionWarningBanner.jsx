import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Clock } from "lucide-react";
import { useShop } from "../context/ShopContext";
import { getSubscription } from "../services/subscriptionService";

/**
 * Bandeau affiché en haut des pages principales pour tenir l'utilisateur
 * informé de l'état de son abonnement en permanence, pas seulement au
 * moment critique :
 *  - TRIAL (loin de sa fin)   -> bandeau neutre "Essai gratuit — X jours restants"
 *  - TRIAL_ENDING / PAST_DUE  -> bandeau orange avec le warningMessage du backend
 *  - ACTIVE                   -> rien (abonnement en règle, pas besoin de le rappeler)
 *  - EXPIRED                  -> rien ici (l'utilisateur est de toute façon
 *                                 redirigé vers /subscription par l'intercepteur api.js)
 */
export default function SubscriptionWarningBanner() {
  const navigate = useNavigate();
  const { selectedShopId: shopId } = useShop();
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    if (!shopId) return;
    let cancelled = false;
    getSubscription(shopId)
      .then((data) => {
        if (!cancelled) setSubscription(data);
      })
      .catch(() => {
        // Silencieux : un bandeau d'information ne doit jamais faire
        // planter l'affichage du reste de la page si l'appel échoue.
      });
    return () => { cancelled = true; };
  }, [shopId]);

  if (!subscription || subscription.status === "ACTIVE" || subscription.status === "EXPIRED") {
    return null;
  }

  const isUrgent = subscription.status === "TRIAL_ENDING" || subscription.status === "PAST_DUE";

  const message = isUrgent
    ? subscription.warningMessage
    : `Essai gratuit — ${subscription.daysRemaining} jour${subscription.daysRemaining > 1 ? "s" : ""} restant${subscription.daysRemaining > 1 ? "s" : ""}.`;

  if (!message) return null;

  return (
    <button
      onClick={() => navigate("/subscription")}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors text-left ${
        isUrgent
          ? "bg-[#ffddb9] text-[#663e00] hover:bg-[#ffcf9b]"
          : "bg-[#ddffea] text-[#005138] hover:bg-[#c9f5da]"
      }`}
    >
      {isUrgent ? <AlertTriangle size={18} className="shrink-0" /> : <Clock size={18} className="shrink-0" />}
      <span className="flex-1">{message}</span>
      <span className="text-xs font-bold uppercase tracking-wider underline shrink-0">Voir mon abonnement</span>
    </button>
  );
}