import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PartyPopper } from "lucide-react";
import { useShop } from "../context/ShopContext";
import { getSubscription } from "../services/subscriptionService";

const dateFormatter = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "long", year: "numeric" });

/**
 * Modale de bienvenue affichée une seule fois, juste après l'inscription,
 * pour annoncer clairement le début de l'essai gratuit et sa date de fin.
 *
 * Déclenchement : AuthPage passe `{ justRegistered: true }` dans le state
 * de navigation après une inscription réussie (pas après une connexion).
 * On consomme ce flag immédiatement (history.replaceState) pour qu'il ne
 * réapparaisse pas si l'utilisateur revient en arrière ou recharge la page.
 *
 * À monter une fois, haut dans l'arbre (ex: dans AppShell ou juste après
 * le choix de la boutique), pas sur chaque page individuellement.
 */
export default function WelcomeTrialModal() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedShopId: shopId } = useShop();
  const [show, setShow] = useState(false);
  const [trialEndsAt, setTrialEndsAt] = useState(null);

  useEffect(() => {
    if (location.state?.justRegistered) {
      sessionStorage.setItem("sellam-just-registered", "1");
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    if (!shopId || sessionStorage.getItem("sellam-just-registered") !== "1") return;
    sessionStorage.removeItem("sellam-just-registered");

    getSubscription(shopId)
      .then((data) => {
        setTrialEndsAt(data.trialEndsAt || null);
        setShow(true);
      })
      .catch(() => {
        // Si l'appel échoue, on affiche quand même un message générique
        // plutôt que de bloquer silencieusement la bienvenue.
        setShow(true);
      });
  }, [location.state, location.pathname, navigate, shopId]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 text-center shadow-xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#ddffea]">
          <PartyPopper size={28} className="text-[#006547]" />
        </div>
        <h2 className="text-xl font-bold text-[#141e1a] mb-2">Bienvenue sur Sellam !</h2>
        <p className="text-sm text-[#3e4943] mb-1">
          Votre essai gratuit de <strong>14 jours</strong> vient de démarrer.
        </p>
        {trialEndsAt && (
          <p className="text-sm text-[#3e4943] mb-4">
            Profitez-en pleinement jusqu'au <strong>{dateFormatter.format(new Date(trialEndsAt))}</strong>.
          </p>
        )}
        <p className="text-xs text-[#6e7a72] mb-6">
          Vous pourrez suivre votre abonnement à tout moment depuis le menu.
        </p>
        <button
          onClick={() => setShow(false)}
          className="w-full bg-[#006547] text-white rounded-lg py-3 text-sm font-bold uppercase tracking-wider hover:bg-[#12805c] transition-colors"
        >
          Compris, c'est parti !
        </button>
      </div>
    </div>
  );
}
