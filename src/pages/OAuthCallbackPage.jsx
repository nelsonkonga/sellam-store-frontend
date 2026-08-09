import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function OAuthCallbackPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        const token = searchParams.get("token");
        const accountId = searchParams.get("accountId");
        const name = searchParams.get("name");
        const email = searchParams.get("email");
        const emailVerified = searchParams.get("emailVerified") === "true";

        if (token && accountId) {
            login({ token, accountId, name, email, emailVerified });
            navigate("/shops");
        } else {
            navigate("/login?error=oauth_failed");
        }
    }, [searchParams, login, navigate]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-hero-gradient text-white">
            <p>Connexion en cours...</p>
        </div>
    );
}