import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthStatusLayout from "../components/AuthStatusLayout";

function extractOAuthParams() {
    const combined = new URLSearchParams();

    const search = window.location.search ?? "";
    const hash = window.location.hash ?? "";

    if (search) {
        const searchParams = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
        searchParams.forEach((value, key) => combined.set(key, value));
    }

    if (hash) {
        const hashParams = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
        hashParams.forEach((value, key) => combined.set(key, value));
    }

    return {
        token: combined.get("token"),
        personId: combined.get("personId"),
        name: combined.get("name"),
        email: combined.get("email"),
        emailVerified: combined.get("emailVerified") === "true",
    };
}

export default function OAuthCallbackPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

const hasRun = useRef(false);

useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    try {
        const { token, personId, name, email, emailVerified } = extractOAuthParams();

        if (token && personId) {
            login({ token, accountId: personId, name, email, emailVerified });
            navigate("/shops", { replace: true });
            return;
        }

        navigate("/oauth-error?error=oauth_failed&message=" + encodeURIComponent("Paramètres OAuth manquants ou invalides."), { replace: true });
    } catch (error) {
        console.error("OAuth callback error:", error);
        navigate("/oauth-error?error=oauth_failed&message=" + encodeURIComponent(error.message || "Erreur lors du traitement du callback OAuth."), { replace: true });
    }
}, [login, navigate]);

    return (
        <AuthStatusLayout>
            <h1 className="text-xl font-bold">Connexion en cours...</h1>
            <p className="mt-2 text-sm text-gray-300">Vérification de votre compte et préparation de votre espace.</p>
        </AuthStatusLayout>
    );
}