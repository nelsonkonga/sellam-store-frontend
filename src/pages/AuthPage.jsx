import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck, UserRound } from "lucide-react";
import { login, register } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import FormField from "../components/FormField";
import PhoneNumberInput from "../components/PhoneNumberInput";
import PasswordStrengthIndicator from "../components/PasswordStrengthIndicator";

const MODES = { LOGIN: "login", REGISTER: "register" };

export default function AuthPage({ mode: initialMode = MODES.LOGIN }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: loginContext, isAuthenticated } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState({ name: "", phoneNumber: "", email: "", identifier: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isLogin = mode === MODES.LOGIN;
  const authMessage = location.state?.message || "";

  useEffect(() => {
    setMode(initialMode);
    setError("");
    setForm({ name: "", phoneNumber: "", email: "", identifier: "", password: "" });
  }, [initialMode]);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("reason") === "expired") setError("Votre session a expiré. Reconnectez-vous pour continuer.");
  }, []);

  useEffect(() => {
    if (isAuthenticated) navigate(location.state?.from?.pathname || "/shops", { replace: true });
  }, [isAuthenticated, location.state, navigate]);

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const handlePhoneChange = (phoneNumber) => setForm((current) => ({ ...current, phoneNumber }));

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = isLogin ? await login({ identifier: form.identifier, password: form.password }) : await register(form);
      loginContext({ ...data, phoneNumber: data.phoneNumber, email: data.email, userType: data.userType, shopId: data.shopId });
      navigate(location.state?.from?.pathname || "/shops", { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error;
      setError(message || (err.response?.status === 401 ? "Identifiant ou mot de passe incorrect." : err.response?.status === 409 ? "Ce numéro est déjà utilisé." : "Une erreur est survenue. Veuillez réessayer."));
    } finally { setLoading(false); }
  }

  const googleUrl = `${(import.meta.env.VITE_API_URL || "http://localhost:8080").replace(/\/api$/, "")}/oauth2/authorization/google`;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f1fcf5] p-4 md:p-8">
      <section className="grid min-h-[600px] w-full max-w-6xl overflow-hidden rounded-xl border border-[#bdc9c1] bg-white shadow-[0_2px_8px_rgba(20,30,26,0.08)] md:grid-cols-2">
        <div className="flex flex-col justify-center px-6 py-10 md:px-12 lg:px-20">
          <div className="mb-8"><h1 className="font-display text-3xl font-semibold text-[#006547]">Sellam</h1><p className="mt-2 text-base text-[#3e4943]">{isLogin ? "Connectez-vous pour accéder à votre espace de gestion." : "Créez votre espace de gestion commerciale."}</p></div>
          {authMessage && <div className="mb-4 rounded-lg border border-[#ffddb9] bg-[#fff8f1] px-3 py-2 text-sm text-[#7d4d00]">{authMessage}</div>}
          {error && <div role="alert" className="mb-4 rounded-lg border border-[#e9aaa2] bg-[#fff0ee] px-3 py-2 text-sm text-[#93000a]">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && <FormField id="name" label="Nom complet" value={form.name} onChange={update} placeholder="Ex: Amina Traoré" autoComplete="name" />}
            {isLogin ? <IconField id="identifier" label="Email ou Téléphone" value={form.identifier} onChange={update} placeholder="nom@entreprise.com" autoComplete="username" icon={UserRound} /> : <><PhoneNumberInput label="Numéro de téléphone" value={form.phoneNumber} onChange={handlePhoneChange} placeholder="690000000" /><FormField id="email" label="Adresse Email" type="email" value={form.email} onChange={update} placeholder="nom@entreprise.com" autoComplete="email" /></>}
            <IconField id="password" label="Mot de passe" type={showPassword ? "text" : "password"} value={form.password} onChange={update} placeholder="••••••••" autoComplete={isLogin ? "current-password" : "new-password"} icon={LockKeyhole} trailing={<button type="button" aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"} onClick={() => setShowPassword(!showPassword)} className="text-[#6e7a72] hover:text-[#006547]">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>} />
            {isLogin && <div className="flex justify-end"><Link to="/forgot-password" className="text-sm text-[#006547] hover:underline">Mot de passe oublié ?</Link></div>}
            <button type="submit" disabled={loading} className="flex h-12 w-full items-center justify-center rounded-lg bg-[#12805c] px-4 text-base font-bold text-white shadow-sm transition hover:bg-[#006547] disabled:opacity-60">{loading ? "Veuillez patienter..." : isLogin ? "Se connecter" : "Créer mon compte"}</button>
          </form>
          <div className="my-6 flex items-center gap-3"><div className="h-px flex-1 bg-[#bdc9c1]" /><span className="bg-white px-2 text-sm text-[#3e4943]">Ou continuer avec</span><div className="h-px flex-1 bg-[#bdc9c1]" /></div>
          <a href={googleUrl} className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#bdc9c1] text-base text-[#141e1a] hover:bg-[#ebf6ef]"><GoogleIcon /> Connexion Google</a>
          <div className="mt-8 flex items-start gap-2 rounded-lg border border-[#bdc9c1] bg-[#f1fcf5] p-4 text-sm leading-6 text-[#3e4943]"><ShieldCheck size={20} className="mt-0.5 shrink-0 text-[#006547]" /><span>Connexion sécurisée. Vous serez redirigé vers votre tableau de bord personnel après authentification.</span></div>
          <p className="mt-6 text-center text-sm text-[#6e7a72]">{isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"} <Link to={isLogin ? "/register" : "/login"} className="font-semibold text-[#006547] hover:underline">{isLogin ? "Inscrivez-vous" : "Connectez-vous"}</Link></p>
        </div>
        <div className="relative hidden min-h-[600px] overflow-hidden bg-[#e5f1ea] md:block"><img src="/shopping-bag.png" alt="Connexion Sellam" className="h-full w-full object-cover" /><div className="absolute inset-0 bg-black/20" /><div className="absolute bottom-12 left-10 right-10 rounded-xl border border-[#bdc9c1]/60 bg-white/90 p-6 shadow-sm"><h2 className="font-display text-xl font-semibold text-[#141e1a]">Commerce vivant, contrôle calme.</h2><p className="mt-2 text-sm leading-6 text-[#3e4943]">L'outil de pilotage pensé pour l'énergie du retail et la stabilité de la gestion financière.</p></div></div>
      </section>
    </main>
  );
}

function GoogleIcon() { return <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true"><path fill="#4285F4" d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12s3.36-7.27 7.19-7.27c3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.19 2C6.42 2 2.03 6.8 2.03 12s4.39 10 10.16 10c5.52 0 9.81-3.87 9.81-9.6 0-1.25-.15-1.98-.15-1.98z" /></svg>; }

function IconField({ id, label, type = "text", value, onChange, placeholder, autoComplete, icon: Icon, trailing }) {
  return <div className="flex flex-col gap-1.5"><label htmlFor={id} className="text-sm font-medium text-[#3e4943]">{label}</label><div className="relative"><Icon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6e7a72]" size={18} /><input id={id} name={id} type={type} value={value} onChange={onChange} placeholder={placeholder} autoComplete={autoComplete} required className="h-11 w-full rounded-lg border border-[#bdc9c1] bg-white py-2 pl-10 pr-10 text-base text-[#141e1a] outline-none placeholder:text-[#6e7a72] focus:border-[#006547] focus:ring-1 focus:ring-[#006547]" />{trailing && <span className="absolute right-3 top-1/2 -translate-y-1/2">{trailing}</span>}</div></div>;
}
