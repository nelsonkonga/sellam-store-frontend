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
        <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between gap-3 bg-amber-500/15 border-b border-amber-500/30 px-4 py-2.5 text-sm text-amber-200 backdrop-blur-sm">
            <div className="flex items-center gap-2">
                <Mail size={16} className="flex-shrink-0" />
                <span>
          {sent
              ? "Email de vérification renvoyé, vérifiez votre boîte."
              : "Vérifiez votre adresse email pour sécuriser votre compte."}
        </span>
                {!sent && (
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={sending}
                        className="font-semibold underline hover:no-underline disabled:opacity-50"
                    >
                        {sending ? "Envoi..." : "Renvoyer le lien"}
                    </button>
                )}
            </div>
            <button
                type="button"
                onClick={() => setDismissed(true)}
                aria-label="Fermer"
                className="flex-shrink-0 rounded p-1 hover:bg-white/10"
            >
                <X size={16} />
            </button>
        </div>
    );
}