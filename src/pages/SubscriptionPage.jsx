import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, AlertTriangle, XCircle, Clock, CreditCard, Smartphone, Copy, Check } from "lucide-react";
import { useShop } from "../context/ShopContext";
import { getSubscription, initiateSubscriptionPayment } from "../services/subscriptionService";
import { getManualPaymentInfo } from "../services/paymentService";


const dateFormatter = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
const currencyFormatter = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", maximumFractionDigits: 0 });

// Chargement paresseux et unique du SDK CinetPay Seamless : on ne l'injecte
// qu'au moment où l'utilisateur en a réellement besoin (clic sur "Payer"),
// pas au chargement de la page, pour ne pas alourdir inutilement le reste
// de l'app pour les boutiques dont l'abonnement est déjà actif.
function loadCinetPaySdk() {
  return new Promise((resolve, reject) => {
    if (window.CinetPay) {
      resolve(window.CinetPay);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.cinetpay.com/seamless/main.js";
    script.async = true;
    script.onload = () => resolve(window.CinetPay);
    script.onerror = () => reject(new Error("Impossible de charger le module de paiement. Vérifiez votre connexion."));
    document.body.appendChild(script);
  });
}

// Code d'erreur renvoyé par le backend (cf. GlobalExceptionHandler) quand
// CinetPay est injoignable ou refuse la requête. Sert de signal explicite
// pour basculer automatiquement sur les instructions de paiement manuel,
// plutôt que d'afficher une erreur bloquante à l'utilisateur.
const PAYMENT_PROVIDER_UNAVAILABLE = "PAYMENT_PROVIDER_UNAVAILABLE";

const STATUS_CONFIG = {
  TRIAL: { label: "Essai gratuit", icon: Clock, color: "#006547", bg: "#ddffea" },
  TRIAL_ENDING: { label: "Essai bientôt terminé", icon: AlertTriangle, color: "#663e00", bg: "#ffddb9" },
  ACTIVE: { label: "Abonnement actif", icon: CheckCircle2, color: "#006547", bg: "#ddffea" },
  PAST_DUE: { label: "Paiement en retard", icon: AlertTriangle, color: "#663e00", bg: "#ffddb9" },
  EXPIRED: { label: "Abonnement expiré", icon: XCircle, color: "#93000a", bg: "#ffdad6" },
};

function ManualPaymentPanel({ amount, manualInfo, loadingInfo }) {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleCopy = () => {
    if (!manualInfo?.mobileMoneyNumber) return;
    navigator.clipboard.writeText(manualInfo.mobileMoneyNumber.replace(/\s/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-[#ffddb9] rounded-xl p-6 mt-4">
      <div className="flex items-center gap-2 mb-3">
        <Smartphone size={20} className="text-[#663e00]" />
        <h3 className="text-base font-semibold text-[#141e1a]">Paiement manuel disponible</h3>
      </div>
      <p className="text-sm text-[#6e7a72] mb-4">
        Le paiement en ligne est momentanément indisponible. Vous pouvez régler votre abonnement
        directement par Mobile Money, puis nous envoyer votre preuve de paiement pour activation rapide.
      </p>

      {loadingInfo ? (
        <p className="text-sm text-[#6e7a72]">Chargement des instructions de paiement...</p>
      ) : manualInfo ? (
        <>
          <div className="bg-[#fff8ee] border border-[#ffddb9] rounded-lg p-4 mb-4">
            <p className="text-xs font-bold uppercase tracking-wider text-[#663e00] mb-1">
              {manualInfo.mobileMoneyOperator} — Montant : {currencyFormatter.format(amount)}
            </p>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-lg font-bold text-[#141e1a] font-mono">{manualInfo.mobileMoneyNumber}</p>
                <p className="text-sm text-[#3e4943]">Au nom de : {manualInfo.mobileMoneyHolderName}</p>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-lg border border-[#bdc9c1] bg-white px-3 py-2 text-xs font-medium text-[#3e4943] hover:bg-[#ebf6ef] shrink-0"
              >
                {copied ? <Check size={14} className="text-[#006547]" /> : <Copy size={14} />}
                {copied ? "Copié" : "Copier"}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/support", {
              state: {
                prefillTicket: {
                  subject: "Preuve de paiement d'abonnement (Mobile Money)",
                  category: "BILLING",
                  priority: "HIGH",
                  initialMessage: `Bonjour,\n\nJe viens d'effectuer un paiement manuel de ${currencyFormatter.format(amount)} via ${manualInfo?.mobileMoneyOperator || "Mobile Money"} pour renouveler mon abonnement.\n\nVeuillez trouver ci-joint ma preuve de paiement (capture d'écran du message de confirmation).\n\nMerci de vérifier et d'activer mon abonnement.`,
                },
              },
            })}
            className="w-full flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold uppercase tracking-wider bg-[#663e00] text-white hover:opacity-90 transition-colors"
          >
            Envoyer ma preuve de paiement au support
          </button>
          <p className="text-xs text-[#6e7a72] mt-3 text-center">
            Après vérification, votre abonnement sera activé sous peu de temps par notre équipe.
          </p>
        </>
      ) : (
        <p className="text-sm text-[#93000a]">
          Impossible de charger les instructions de paiement manuel. Contactez le support directement.
        </p>
      )}
    </div>
  );
}

export default function SubscriptionPage() {
  const navigate = useNavigate();
  const { selectedShopId: shopId } = useShop();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);

  // Bascule automatique vers le paiement manuel dès que CinetPay échoue
  // (cf. PAYMENT_PROVIDER_UNAVAILABLE) — pas une préférence de l'utilisateur,
  // mais une conséquence directe de l'échec du paiement en ligne.
  const [showManualPayment, setShowManualPayment] = useState(false);
  const [manualInfo, setManualInfo] = useState(null);
  const [loadingManualInfo, setLoadingManualInfo] = useState(false);
  const [planAmount, setPlanAmount] = useState(1000); // valeur de repli le temps du chargement, écrasée par getManualPaymentInfo

  const loadSubscription = useCallback(async () => {
    if (!shopId) {
      navigate("/shops");
      return;
    }
    try {
      setLoading(true);
      const data = await getSubscription(shopId);
      setSubscription(data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Impossible de charger votre abonnement pour le moment.");
    } finally {
      setLoading(false);
    }
  }, [shopId, navigate]);

  useEffect(() => {
    loadSubscription();
  }, [loadSubscription]);

  // Le montant du plan vient du backend (app.subscription.plan-amount-xof)
  // plutôt que d'être codé en dur ici, pour rester synchronisé même si le
  // tarif change côté serveur sans redéploiement du frontend.
  useEffect(() => {
    getManualPaymentInfo()
      .then((info) => {
        if (info.planAmountXof) setPlanAmount(info.planAmountXof);
      })
      .catch(() => { /* garde la valeur de repli, non bloquant */ });
  }, []);

  async function switchToManualPayment() {
    setShowManualPayment(true);
    if (manualInfo) return; // déjà chargé, pas besoin de refaire l'appel
    try {
      setLoadingManualInfo(true);
      const info = await getManualPaymentInfo();
      setManualInfo(info);
    } catch (err) {
      console.error("Impossible de charger les infos de paiement manuel", err);
    } finally {
      setLoadingManualInfo(false);
    }
  }

  async function handlePay() {
    setPaying(true);
    setError("");
    try {
      const payment = await initiateSubscriptionPayment(shopId);
      const CinetPay = await loadCinetPaySdk();

      CinetPay.setConfig({
        apikey: undefined, // non nécessaire côté client en mode Seamless avec un paymentToken déjà généré côté serveur
        site_id: payment.siteId,
        notify_url: undefined,
        mode: "PRODUCTION",
      });

      CinetPay.getCheckout({
        transaction_id: payment.transactionId,
        payment_token: payment.paymentToken,
        amount: payment.amount,
        currency: payment.currency,
      });

      CinetPay.waitResponse((result) => {
        setPaying(false);
        // Quel que soit le résultat immédiat renvoyé par le widget, la seule
        // source de vérité est le webhook serveur (cf. PaymentService) : on se
        // contente de rafraîchir l'état affiché après un court délai pour lui
        // laisser le temps d'arriver, plutôt que de se fier à ce callback.
        setTimeout(loadSubscription, 3000);
      });

      CinetPay.onError((err) => {
        setPaying(false);
        console.error("CinetPay error", err);
        // Un échec du widget lui-même (pas de l'initiation serveur) bascule
        // aussi sur le paiement manuel, pour la même raison : le paiement
        // en ligne n'est pas utilisable dans l'immédiat pour ce gérant.
        switchToManualPayment();
      });
    } catch (err) {
      setPaying(false);
      const errorCode = err.response?.data?.error;
      if (errorCode === PAYMENT_PROVIDER_UNAVAILABLE) {
        // Cas attendu tant que CinetPay n'est pas pleinement activé : pas
        // une erreur à afficher en rouge, juste une bascule silencieuse
        // vers l'alternative.
        switchToManualPayment();
      } else {
        setError(err.response?.data?.message || err.message || "Impossible d'initier le paiement pour le moment.");
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f1fcf5] flex items-center justify-center">
        <p className="text-sm text-[#6e7a72]">Chargement de votre abonnement...</p>
      </div>
    );
  }

  const statusConfig = subscription ? (STATUS_CONFIG[subscription.status] || STATUS_CONFIG.TRIAL) : STATUS_CONFIG.TRIAL;
  const StatusIcon = statusConfig.icon;

  const relevantDate = subscription?.status === "ACTIVE" || subscription?.status === "PAST_DUE"
    ? subscription?.currentPeriodEndsAt
    : subscription?.trialEndsAt;

  const showPayButton = subscription && subscription.status !== "ACTIVE";

  return (
    <div className="min-h-screen bg-[#f1fcf5] pb-24 text-[#141e1a]">
      <div className="mx-auto max-w-3xl px-5 py-6 md:px-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate("/dashboard")} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#bdc9c1] bg-white text-[#3e4943] hover:bg-[#ebf6ef]">
            <ArrowLeft size={20} />
          </button>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#006547]">Compte</p>
            <h1 className="font-display text-3xl font-bold">Mon abonnement</h1>
            <p className="text-sm text-[#6e7a72]">Gérez votre abonnement Sellam pour cette boutique.</p>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-[#ffdad6] bg-[#ffdad6] p-4 text-sm text-[#93000a] mb-6">
            {error}
          </div>
        )}

        {subscription && (
          <>
            {/* Carte de statut principal */}
            <div className="bg-white border border-[#bdc9c1] rounded-xl p-6 mb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full shrink-0" style={{ backgroundColor: statusConfig.bg }}>
                  <StatusIcon size={24} style={{ color: statusConfig.color }} />
                </div>
                <div>
                  <p className="text-lg font-semibold" style={{ color: statusConfig.color }}>{statusConfig.label}</p>
                  <p className="text-sm text-[#6e7a72]">
                    Plan {subscription.plan === "STANDARD" ? "Standard" : "Essai gratuit"}
                  </p>
                </div>
              </div>

              {subscription.warningMessage && (
                <div className="rounded-lg p-3 mb-4 text-sm" style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}>
                  {subscription.warningMessage}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#ebf6ef]">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#3e4943] mb-1">
                    {subscription.status === "ACTIVE" || subscription.status === "PAST_DUE" ? "Fin de la période" : "Fin de l'essai"}
                  </p>
                  <p className="text-base font-medium text-[#141e1a]">
                    {relevantDate ? dateFormatter.format(new Date(relevantDate)) : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#3e4943] mb-1">Jours restants</p>
                  <p className="text-base font-medium text-[#141e1a]">
                    {subscription.daysRemaining !== null && subscription.daysRemaining !== undefined
                      ? `${subscription.daysRemaining} jour${subscription.daysRemaining > 1 ? "s" : ""}`
                      : "—"}
                  </p>
                </div>
              </div>

              {subscription.bonusDaysEarned > 0 && (
                <p className="text-xs text-[#006547] mt-3">
                  🎁 Vous avez gagné {subscription.bonusDaysEarned} jour{subscription.bonusDaysEarned > 1 ? "s" : ""} grâce au parrainage.
                </p>
              )}
            </div>

            {/* Carte de paiement */}
            {showPayButton && (
              <div className="bg-white border border-[#bdc9c1] rounded-xl p-6">
                <h3 className="text-lg font-semibold text-[#141e1a] mb-2">Plan Standard</h3>
                <p className="text-sm text-[#6e7a72] mb-4">
                  Accès complet à Sellam : ventes, stocks, caisses, rapports, équipe.
                </p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-bold text-[#141e1a]">{currencyFormatter.format(planAmount)}</span>
                  <span className="text-sm text-[#6e7a72]">/ 30 jours</span>
                </div>

                {!showManualPayment && (
                  <button
                    onClick={handlePay}
                    disabled={paying}
                    className={`w-full flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold uppercase tracking-wider transition-colors ${
                      paying ? "bg-[#bdc9c1] text-[#6e7a72] cursor-not-allowed" : "bg-[#006547] text-white hover:bg-[#12805c]"
                    }`}
                  >
                    <CreditCard size={18} />
                    {paying ? "Connexion en cours..." : subscription.status === "EXPIRED" ? "Réactiver mon abonnement" : "Payer maintenant"}
                  </button>
                )}

                {!showManualPayment && (
                  <p className="text-xs text-[#6e7a72] mt-3 text-center">
                    Paiement sécurisé via Mobile Money, carte bancaire.
                  </p>
                )}

                {showManualPayment && (
                  <ManualPaymentPanel amount={planAmount} manualInfo={manualInfo} loadingInfo={loadingManualInfo} />
                )}
              </div>
            )}

            {subscription.status === "ACTIVE" && (
              <div className="bg-white border border-[#bdc9c1] rounded-xl p-6 text-center">
                <CheckCircle2 size={32} className="text-[#006547] mx-auto mb-2" />
                <p className="text-sm text-[#3e4943]">
                  Votre abonnement est actif jusqu'au {relevantDate ? dateFormatter.format(new Date(relevantDate)) : "—"}.
                  Vous recevrez un rappel avant son expiration.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      
    </div>
  );
}