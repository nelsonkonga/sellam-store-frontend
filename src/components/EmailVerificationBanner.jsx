import { useState } from "react";
import { Mail, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function EmailVerificationBanner() {
    const { email, emailVerified } = useAuth();
    const [dismissed, setDismissed] = useState(false);
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);


    if (!email || emailVerified || dismissed) return null;

    async function handleResend() {
        setSending(true);
        try {
            await api.post("/auth/resend-verification");
            setSent(true);
        } catch (err) {

        } finally {
            setSending(false);
        }
    }

    return (
<div className="sticky top-0 z-50 flex items-center justify-between gap-4 border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm animate-fadeIn">
  <div className="flex items-center gap-2.5 min-w-0">
    {/* Cloche d'alerte animée pour attirer l'attention proprement */}
    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800">
      <Mail size={14} className="animate-pulse" />
    </div>
    <p className="truncate font-medium">
      {sent
        ? "Email de vérification renvoyé ! Pensez à vérifier vos courriers indésirables (spams)."
        : "Vérifiez votre adresse email pour sécuriser l'accès à votre boutique."}
    </p>
    
    {/* Bouton d'action transformé en petit badge cliquable moderne */}
    {!sent && (
      <button
        type="button"
        onClick={handleResend}
        disabled={sending}
        className="ml-2 shrink-0 rounded-lg bg-amber-600 px-3 py-1 text-xs font-bold text-white transition hover:bg-amber-700 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
      >
        {sending ? "Envoi en cours..." : "Renvoyer le lien"}
      </button>
    )}
  </div>

  {/* Bouton de fermeture épuré */}
  <button
    type="button"
    onClick={() => setDismissed(true)}
    aria-label="Fermer la notification"
    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-amber-700 transition hover:bg-amber-100 hover:text-amber-900"
  >
    <X size={16} />
  </button>
</div>

    );
}