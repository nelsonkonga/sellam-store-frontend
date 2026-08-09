import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login, register } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import FormField from "../components/FormField";
import DarkModeToggle from "../components/DarkModeToggle";


const MODES = {
  LOGIN: "login",
  REGISTER: "register",
};

export default function AuthPage() {
  const [mode, setMode] = useState(MODES.LOGIN);
  const [form, setForm] = useState({ name: "", phoneNumber: "", email:"", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get("reason") === "expired") {
            setError("Votre session a expiré. Reconnectez-vous pour continuer.");
        }
    }, []);
  
  const navigate = useNavigate();
  const { login: loginContext } = useAuth();

  const isLogin = mode === MODES.LOGIN;

  // Bascule entre connexion et inscription, en réinitialisant erreur + champs
  const toggleMode = () => {
    setMode(isLogin ? MODES.REGISTER : MODES.LOGIN);
    setError("");
    setForm({ name: "", phoneNumber: "",email: "", password: "" });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = isLogin
        ? { phoneNumber: form.phoneNumber, email: form.email, password: form.password }
        : form; // name + phoneNumber + email + password

      const data = isLogin ? await login(payload) : await register(payload);

      // Stocke token/accountId/userType/shopId/name dans le contexte global + localStorage
      loginContext({ ...data, phoneNumber: data.phoneNumber, email: data.email, userType: data.userType, shopId: data.shopId });

      // Redirection vers la liste des boutiques
      navigate("/shops");
    } catch (err) {
      // On essaie d'extraire un message clair renvoyé par le backend Spring Boot
      const backendMessage =
        err.response?.data?.message || err.response?.data?.error;

      if (backendMessage) {
        setError(backendMessage);
      } else if (err.response?.status === 401) {
        setError("Numéro de téléphone ou mot de passe incorrect.");
      } else if (err.response?.status === 409) {
        setError("Ce numéro est déjà utilisé.");
      } else {
        setError("Une erreur est survenue. Veuillez réessayer.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center
                 bg-hero-gradient px-5 py-10 text-white"
    >
      {/* Bouton mode sombre, accessible depuis l'écran d'auth */}
      <div className="mb-4 flex w-full max-w-sm justify-end">
        <DarkModeToggle />
      </div>

      <div className="w-full max-w-sm">
        {/* Logo / nom de l'app */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl
                       btn-gradient text-2xl font-bold text-white shadow-xl glow-purple"
          >
            🛍️
          </div>
          <h1 className="text-2xl font-bold text-white">
            ShopManager
          </h1>
          <p className="text-sm text-gray-300">
            Gérez vos boutiques facilement
          </p>
        </div>

        {/* Carte du formulaire */}
        <div
          className="rounded-2xl glass p-6 shadow-xl"
        >
          {/* Toggle Connexion / Inscription */}
          <div
            className="mb-6 flex rounded-xl bg-gray-100 p-1 dark:bg-gray-800"
            role="tablist"
          >
            <button
              type="button"
              role="tab"
              aria-selected={isLogin}
              onClick={() => mode !== MODES.LOGIN && toggleMode()}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
                isLogin
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-gray-400"
              }`}
            >
              Connexion
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={!isLogin}
              onClick={() => mode !== MODES.REGISTER && toggleMode()}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
                !isLogin
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-gray-400"
              }`}
            >
              Inscription
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Le champ "name" n'apparaît qu'en mode inscription */}
            {!isLogin && (
              <FormField
                id="name"
                label="Nom complet"
                value={form.name}
                onChange={handleChange}
                placeholder="Ex: Amina Traoré"
                autoComplete="name"
              />
            )}

            <FormField
              id="phoneNumber"
              label="Numéro de téléphone"
              type="tel"
              value={form.phoneNumber}
              onChange={handleChange}
              placeholder="Ex: 077 123 45 67"
              autoComplete="tel"
            />

            <FormField
                id="email"
                label="Adresse Email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Ex: jean@abessolo.com"
                autoComplete="email"
            />

            <FormField
              id="password"
              label="Mot de passe"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete={isLogin ? "current-password" : "new-password"}
            />

            {/* Lien mot de passe oublié, uniquement pertinent en mode connexion */}
            {isLogin && (
              <div className="-mt-2 flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-brand-400 hover:underline"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
            )}

            {/* Message d'erreur clair sous le formulaire */}
            {error && (
              <div
                role="alert"
                className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600
                           dark:bg-red-950/50 dark:text-red-400"
              >
                {error}
              </div>
            )}

            {/* Bouton principal, gros et facile à toucher sur mobile */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl btn-gradient py-3.5 text-base font-semibold
                         text-white shadow-md transition
                         disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Veuillez patienter..."
                : isLogin
                ? "Se connecter"
                : "Créer mon compte"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-gray-500">ou</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <button
            type="button"
            enabled
            title="Disponible"
            className="flex w-full cursor-not-allowed items-center justify-center gap-2
                       rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium
                       text-gray-400 opacity-70"
            style={{padding:0}}
          >
            <a
                href={`${import.meta.env.VITE_API_URL || "http://localhost:8080/api"}/../oauth2/authorization/google`}
                className="flex w-full items-center justify-center gap-2
             rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium
             text-white transition hover:bg-white/10"
            >
            <GoogleIcon />
            Se connecter avec Google </a>
          </button>
        </div>

        {/* Lien de bascule sous la carte, pratique en plus du toggle */}
        <p className="mt-6 text-center text-sm text-gray-400">
          {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}{" "}
          <button
            type="button"
            onClick={toggleMode}
            className="font-semibold text-brand-400 hover:underline"
          >
            {isLogin ? "Inscrivez-vous" : "Connectez-vous"}
          </button>
        </p>
      </div>
    </div>
  );
}


function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="currentColor"
        d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12
           s3.36-7.27 7.19-7.27c3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.19 2
           C6.42 2 2.03 6.8 2.03 12s4.39 10 10.16 10c5.52 0 9.81-3.87 9.81-9.6
           0-1.25-.15-1.98-.15-1.98z"
      />
    </svg>
  );
}
