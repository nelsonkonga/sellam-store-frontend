import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState("loading");
    const { markEmailVerified } = useAuth();

    useEffect(() => {
        const token = searchParams.get("token");
        if (!token) {
            setStatus("error");
            return;
        }

        api.post(`/auth/verify-email?token=${token}`)
            .then(() => {
                markEmailVerified();
                setStatus("success");
            })
            .catch(() => setStatus("error"));
    }, [searchParams, markEmailVerified]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-hero-gradient text-white px-5">
            {status === "loading" && <p>Vérification en cours...</p>}
            {status === "success" && (
                <>
                    <p className="text-lg font-semibold">Email vérifié avec succès !</p>
                    <Link to="/shops" className="mt-4 text-brand-400 hover:underline">Continuer</Link>
                </>
            )}
            {status === "error" && (
                <>
                    <p className="text-lg font-semibold text-red-400">Lien invalide ou expiré</p>
                    <Link to="/login" className="mt-4 text-brand-400 hover:underline">Retour à la connexion</Link>
                </>
            )}
        </div>
    );
}