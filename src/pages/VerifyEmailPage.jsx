import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import AuthStatusLayout from "../components/AuthStatusLayout";

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
        <AuthStatusLayout>
            {status === "loading" && <p className="text-lg font-semibold">Vérification en cours...</p>}
            {status === "success" && (
                <>
                    <p className="text-lg font-semibold text-emerald-200">Email vérifié avec succès</p>
                    <Link to="/shops" className="mt-5 inline-flex rounded-md bg-emerald-700 px-4 py-3 font-semibold text-white hover:bg-emerald-600">Continuer</Link>
                </>
            )}
            {status === "error" && (
                <>
                    <p className="text-lg font-semibold text-red-300">Lien invalide ou expiré</p>
                    <Link to="/login" className="mt-5 inline-flex rounded-md border border-white/20 px-4 py-3 font-semibold text-white hover:bg-white/10">Retour à la connexion</Link>
                </>
            )}
        </AuthStatusLayout>
    );
}