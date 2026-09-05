import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { forgotPassword, resetPassword } from "../services/authService";

const PROGRESS_STEPS = [1, 2, 3, 4];

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get("token");

  const [step, setStep] = useState(tokenFromUrl ? "reset" : "phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [sentMessage, setSentMessage] = useState("");
  const [verificationCode, setVerificationCode] = useState(Array(6).fill(""));
  const [codeError, setCodeError] = useState("");
  const [resetToken, setResetToken] = useState(tokenFromUrl || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetError, setResetError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (tokenFromUrl) {
      setResetToken(tokenFromUrl);
      setStep("reset");
    }
  }, [tokenFromUrl]);

  useEffect(() => {
    const tokenValue = verificationCode.join("").trim();
    if (tokenValue.length === 6) {
      setResetToken(tokenValue);
    }
  }, [verificationCode]);

  function updateCode(index, value) {
    if (!/\d|[A-Za-z]/.test(value) && value !== "") return;
    const next = [...verificationCode];
    next[index] = value.slice(-1).toUpperCase();
    setVerificationCode(next);
    setCodeError("");
  }

  async function handleRequestReset() {
    setPhoneError("");
    setSentMessage("");

    if (!phoneNumber || phoneNumber.trim().length < 10) {
      setPhoneError("Entrez un numéro de téléphone valide");
      return;
    }

    setSendingEmail(true);
    try {
      await forgotPassword({ phoneNumber });
      setSentMessage("Un lien de réinitialisation a été envoyé à votre email associé au compte.");
      setStep("code");
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

  function handleVerifyCode() {
    const code = verificationCode.join("").trim();
    if (!code || code.length < 6) {
      setCodeError("Veuillez saisir le code de vérification complet.");
      return;
    }

    setResetToken(code);
    setStep("reset");
  }

  async function handleResetPassword() {
    setResetError("");
    setPasswordError("");

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
      const result = await resetPassword({ resetToken, newPassword });
      setSuccessMessage(result.message || "Votre mot de passe a été réinitialisé avec succès.");
      setStep("success");
      setTimeout(() => navigate("/login"), 2000);
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

  const progressWidth = step === "phone" ? "0%" : step === "code" ? "33%" : step === "reset" ? "66%" : "100%";

  return (
    <main className="flex min-h-screen flex-col bg-[#f1fcf5] p-4 text-[#141e1a] md:p-8">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center">
        <div className="mx-auto w-full max-w-md overflow-hidden rounded-xl border border-[#bdc9c1] bg-white p-6 shadow-[0_2px_4px_rgba(0,33,20,0.04)] md:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold text-[#141e1a] md:text-[2rem]">Réinitialisation du mot de passe</h1>
            <p className="mt-2 text-sm text-[#3e4943]">Commerce vivant, contrôle calme.</p>
          </div>

          <div className="relative mb-6 flex items-center justify-between">
            <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-[#bdc9c1]" />
            <div className="absolute left-0 top-1/2 h-px -translate-y-1/2 bg-[#006547] transition-all duration-300" style={{ width: progressWidth }} />
            {PROGRESS_STEPS.map((value) => (
              <span
                key={value}
                className={`relative z-10 flex h-5 w-5 items-center justify-center rounded-full border-4 border-white ${
                  value <= (step === "phone" ? 1 : step === "code" ? 2 : step === "reset" ? 3 : 4)
                    ? "bg-[#006547]"
                    : "bg-[#dae5de]"
                }`}
              />
            ))}
          </div>

          {step === "phone" && (
            <div className="space-y-5">
              <div>
                <h2 className="mb-2 text-xl font-semibold text-[#141e1a]">Identifiez votre compte</h2>
                <p className="text-sm leading-6 text-[#3e4943]">Entrez l'adresse email ou le numéro de téléphone associé à votre compte Sellam.</p>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="accountId" className="text-sm font-medium text-[#3e4943]">Email ou Téléphone</label>
                <input
                  id="accountId"
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    setPhoneError("");
                  }}
                  placeholder="nom@entreprise.com"
                  className="h-11 w-full rounded-lg border border-[#bdc9c1] bg-white px-3 text-base text-[#141e1a] outline-none placeholder:text-[#6e7a72] focus:border-[#006547] focus:ring-1 focus:ring-[#006547]"
                />
              </div>

              {phoneError && (
                <div className="flex items-start gap-2 rounded-lg border border-[#e9aaa2] bg-[#fff0ee] p-3 text-sm text-[#93000a]">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{phoneError}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleRequestReset}
                disabled={sendingEmail || !phoneNumber.trim()}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#12805c] text-base font-bold text-white transition hover:bg-[#006547] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sendingEmail ? "Envoi en cours..." : "Continuer"}
                <ArrowRight size={18} />
              </button>

              <div className="text-center">
                <Link to="/login" className="text-sm font-medium text-[#006547] hover:underline">Retour à la connexion</Link>
              </div>
            </div>
          )}

          {step === "code" && (
            <div className="space-y-5">
              <div>
                <h2 className="mb-2 text-xl font-semibold text-[#141e1a]">Code de vérification</h2>
                <p className="text-sm leading-6 text-[#3e4943]">Nous avons envoyé un code à 6 chiffres. Veuillez l'entrer ci-dessous.</p>
              </div>

              <div className="flex justify-between gap-2">
                {verificationCode.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => updateCode(index, e.target.value)}
                    className="h-14 w-12 rounded-lg border border-[#bdc9c1] bg-[#f1fcf5] text-center text-lg font-semibold text-[#141e1a] outline-none focus:border-[#006547] focus:ring-1 focus:ring-[#006547]"
                  />
                ))}
              </div>

              {codeError && (
                <div className="flex items-start gap-2 rounded-lg border border-[#e9aaa2] bg-[#fff0ee] p-3 text-sm text-[#93000a]">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{codeError}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleVerifyCode}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#12805c] text-base font-bold text-white transition hover:bg-[#006547]"
              >
                Vérifier
              </button>

              <div className="text-center text-sm text-[#3e4943]">
                Renvoyer le code dans <span className="font-semibold text-[#006547]">00:59</span>
              </div>
            </div>
          )}

          {step === "reset" && (
            <div className="space-y-5">
              <div>
                <h2 className="mb-2 text-xl font-semibold text-[#141e1a]">Nouveau mot de passe</h2>
                <p className="text-sm leading-6 text-[#3e4943]">Créez un nouveau mot de passe fort pour votre compte.</p>
              </div>

              {resetError && (
                <div className="flex items-start gap-2 rounded-lg border border-[#e9aaa2] bg-[#fff0ee] p-3 text-sm text-[#93000a]">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{resetError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="newPassword" className="text-sm font-medium text-[#3e4943]">Nouveau mot de passe</label>
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
                    className="h-11 w-full rounded-lg border border-[#bdc9c1] bg-white px-3 pr-11 text-base text-[#141e1a] outline-none placeholder:text-[#6e7a72] focus:border-[#006547] focus:ring-1 focus:ring-[#006547]"
                  />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6e7a72] hover:text-[#006547]">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-[#3e4943]">Confirmer le mot de passe</label>
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
                    className="h-11 w-full rounded-lg border border-[#bdc9c1] bg-white px-3 pr-11 text-base text-[#141e1a] outline-none placeholder:text-[#6e7a72] focus:border-[#006547] focus:ring-1 focus:ring-[#006547]"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6e7a72] hover:text-[#006547]">
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {passwordError && (
                <div className="flex items-start gap-2 rounded-lg border border-[#e9aaa2] bg-[#fff0ee] p-3 text-sm text-[#93000a]">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleResetPassword}
                disabled={resettingPassword || !newPassword || !confirmPassword}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#12805c] text-base font-bold text-white transition hover:bg-[#006547] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {resettingPassword ? "Réinitialisation en cours..." : "Mettre à jour"}
              </button>
            </div>
          )}

          {step === "success" && (
            <div className="space-y-5 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#DDF4EA]">
                <CheckCircle2 size={32} className="text-[#006547]" />
              </div>

              <div>
                <h2 className="mb-2 text-xl font-semibold text-[#141e1a]">Accès restauré</h2>
                <p className="text-sm leading-6 text-[#3e4943]">{successMessage}</p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#12805c] text-base font-bold text-white transition hover:bg-[#006547]"
              >
                Se connecter
                <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>

        <footer className="mx-auto mt-6 flex w-full max-w-7xl flex-col items-center justify-between gap-4 border-t border-[#bdc9c1] bg-white px-4 py-6 text-sm text-[#6e7a72] md:flex-row md:px-8">
          <div className="text-2xl font-semibold text-[#006547]">Sellam</div>
          <p>© 2026 Sellam. Living Commerce, Calm Control.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-[#006547]">Features</a>
            <a href="#" className="hover:text-[#006547]">Pricing</a>
            <a href="#" className="hover:text-[#006547]">Privacy</a>
            <a href="#" className="hover:text-[#006547]">Terms</a>
          </div>
        </footer>
      </div>
    </main>
  );
}
