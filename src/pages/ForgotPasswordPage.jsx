import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { forgotPassword, resetPassword } from "../services/authService";
import PhoneNumberInput from "../components/PhoneNumberInput";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get("token");

  // Étapes : "phone" | "sent" | "reset" | "success"
  const [step, setStep] = useState(tokenFromUrl ? "reset" : "phone");

  // Étape 1 : Entrer le numéro
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");

  // Étape 2 : Confirmation
  const [sentMessage, setSentMessage] = useState("");

  // Étape 3 : Réinitialiser le mot de passe
  const [resetToken, setResetToken] = useState(tokenFromUrl || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetError, setResetError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Loading states
  const [sendingEmail, setSendingEmail] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (tokenFromUrl) {
      setResetToken(tokenFromUrl);
      setStep("reset");
    }
  }, [tokenFromUrl]);

  // Étape 1 : Demander la réinitialisation
  async function handleRequestReset() {
    setPhoneError("");
    setSentMessage("");

    // Validation
    if (!phoneNumber || phoneNumber.trim().length < 10) {
      setPhoneError("Entrez un numéro de téléphone valide");
      return;
    }

    setSendingEmail(true);
    try {
      await forgotPassword({ phoneNumber });
      setSentMessage("Un lien de réinitialisation a été envoyé à votre email associé au compte.");
      setStep("sent");
      setPhoneNumber("");
    } catch (err) {
      setPhoneError(
        err.response?.data?.message ||
        err.message ||
        "Impossible d'envoyer le lien. Vérifiez le numéro de téléphone."
      );
    } finally {
      setSendingEmail(false);
    }
  }

  // Étape 3 : Réinitialiser le mot de passe
  async function handleResetPassword() {
    setResetError("");
    setPasswordError("");

    // Validation
    if (!resetToken || resetToken.trim().length === 0) {
      setResetError("Le lien de réinitialisation est manquant ou invalide");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setPasswordError("Le mot de passe doit faire au moins 6 caractères");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas");
      return;
    }

    setResettingPassword(true);
    try {
      const result = await resetPassword({
        resetToken,
        newPassword,
      });

      setSuccessMessage(result.message || "Votre mot de passe a été réinitialisé avec succès.");
      setStep("success");

      // Redirection après 2 secondes
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setResetError(
        err.response?.data?.message ||
        err.message ||
        "Impossible de réinitialiser le mot de passe. Le lien a peut-être expiré."
      );
    } finally {
      setResettingPassword(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-900 to-black px-4">
      <div className="w-full max-w-md rounded-2xl glass p-8 shadow-2xl">
        {/* En-tête */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">
            {step === "phone" && "Réinitialiser votre mot de passe"}
            {step === "sent" && "Email envoyé"}
            {step === "reset" && "Créer un nouveau mot de passe"}
            {step === "success" && "Succès!"}
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            {step === "phone" && "Entrez votre numéro de téléphone"}
            {step === "sent" && "Vérifiez votre email"}
            {step === "reset" && "Entrez votre nouveau mot de passe"}
            {step === "success" && "Redirection vers la connexion..."}
          </p>
        </div>

        {/* ÉTAPE 1 : PHONE */}
        {step === "phone" && (
          <div className="space-y-4">
            <PhoneNumberInput
              label="Numéro de téléphone"
              value={phoneNumber}
              onChange={(e164) => {
                setPhoneNumber(e164);
                setPhoneError("");
              }}
              placeholder="690000000"
              error={!!phoneError}
            />
            {phoneError && (
              <div className="mt-2 flex items-start gap-2 rounded-lg bg-red-950/20 border border-red-500/20 p-3">
                <AlertCircle size={16} className="flex-shrink-0 text-red-400 mt-0.5" />
                <p className="text-sm text-red-300">{phoneError}</p>
              </div>
            )}

            <button
              type="button"
              onClick={handleRequestReset}
              disabled={sendingEmail || !phoneNumber.trim()}
              className="w-full rounded-xl bg-brand-500 py-3.5 text-base font-semibold
                       text-white transition hover:bg-brand-600 disabled:cursor-not-allowed
                       disabled:opacity-50"
            >
              {sendingEmail ? "Envoi en cours..." : "Envoyer le lien"}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-400">
                Vous vous souvenez de votre mot de passe?{" "}
                <Link to="/login" className="text-brand-400 hover:underline">
                  Se connecter
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* ÉTAPE 2 : SENT CONFIRMATION */}
        {step === "sent" && (
          <div className="space-y-4">
            <div className="flex justify-center mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle2 size={32} className="text-green-400" />
              </div>
            </div>

            <div className="rounded-xl border border-green-500/20 bg-green-950/20 p-4">
              <p className="text-sm text-green-300 text-center">
                {sentMessage}
              </p>
            </div>

            <div className="space-y-3 text-sm text-gray-400">
              <p>
                <strong>Conseil:</strong> Le lien expire dans 1 heure. Si vous ne l'avez pas reçu, vérifiez votre dossier Spam.
              </p>
              <p>
                Vous pouvez coller le code du lien ci-dessous pour continuer immédiatement:
              </p>
            </div>

            <div>
              <label htmlFor="token" className="block text-sm font-medium text-gray-300 mb-2">
                Code du lien (optionnel)
              </label>
              <input
                id="token"
                type="text"
                value={resetToken}
                onChange={(e) => {
                  setResetToken(e.target.value);
                  setResetError("");
                }}
                placeholder="Collez le code du lien"
                className="w-full rounded-xl border border-white/10 glass-strong px-4 py-3
                         text-base text-white placeholder:text-gray-500
                         focus:border-brand-400 focus:outline-none focus:ring-2
                         focus:ring-brand-400/20"
              />
            </div>

            <button
              type="button"
              onClick={() => setStep("reset")}
              disabled={!resetToken.trim()}
              className="w-full rounded-xl bg-brand-500 py-3.5 text-base font-semibold
                       text-white transition hover:bg-brand-600 disabled:cursor-not-allowed
                       disabled:opacity-50"
            >
              Continuer
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setSentMessage("");
              }}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3.5
                       text-base font-semibold text-white transition hover:bg-white/10"
            >
              Retour
            </button>
          </div>
        )}

        {/* ÉTAPE 3 : RESET PASSWORD */}
        {step === "reset" && (
          <div className="space-y-4">
            {resetError && (
              <div className="flex items-start gap-2 rounded-lg bg-red-950/20 border border-red-500/20 p-3">
                <AlertCircle size={16} className="flex-shrink-0 text-red-400 mt-0.5" />
                <p className="text-sm text-red-300">{resetError}</p>
              </div>
            )}

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setPasswordError("");
                  }}
                  placeholder="Au minimum 6 caractères"
                  disabled={resettingPassword}
                  className="w-full rounded-xl border border-white/10 glass-strong px-4 py-3 pr-12
                           text-base text-white placeholder:text-gray-500
                           focus:border-brand-400 focus:outline-none focus:ring-2
                           focus:ring-brand-400/20 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={resettingPassword}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirmez le mot de passe
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setPasswordError("");
                  }}
                  placeholder="Même mot de passe"
                  disabled={resettingPassword}
                  className="w-full rounded-xl border border-white/10 glass-strong px-4 py-3 pr-12
                           text-base text-white placeholder:text-gray-500
                           focus:border-brand-400 focus:outline-none focus:ring-2
                           focus:ring-brand-400/20 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={resettingPassword}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passwordError && (
                <div className="mt-2 flex items-start gap-2 rounded-lg bg-red-950/20 border border-red-500/20 p-3">
                  <AlertCircle size={16} className="flex-shrink-0 text-red-400 mt-0.5" />
                  <p className="text-sm text-red-300">{passwordError}</p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleResetPassword}
              disabled={resettingPassword || !newPassword || !confirmPassword}
              className="w-full rounded-xl bg-brand-500 py-3.5 text-base font-semibold
                       text-white transition hover:bg-brand-600 disabled:cursor-not-allowed
                       disabled:opacity-50"
            >
              {resettingPassword ? "Réinitialisation en cours..." : "Réinitialiser le mot de passe"}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("sent");
                setResetToken("");
                setNewPassword("");
                setConfirmPassword("");
                setResetError("");
              }}
              disabled={resettingPassword}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3.5
                       text-base font-semibold text-white transition hover:bg-white/10
                       disabled:opacity-50"
            >
              Retour
            </button>
          </div>
        )}

        {/* ÉTAPE 4 : SUCCESS */}
        {step === "success" && (
          <div className="space-y-4 text-center">
            <div className="flex justify-center mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle2 size={32} className="text-green-400" />
              </div>
            </div>

            <div className="rounded-xl border border-green-500/20 bg-green-950/20 p-4">
              <p className="text-sm text-green-300">
                {successMessage}
              </p>
            </div>

            <p className="text-sm text-gray-400">
              Redirection vers la connexion...
            </p>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full rounded-xl bg-brand-500 py-3.5 text-base font-semibold
                       text-white transition hover:bg-brand-600"
            >
              Aller à la connexion
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
