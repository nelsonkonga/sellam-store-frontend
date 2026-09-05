import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import AuthStatusLayout from "../components/AuthStatusLayout";

export default function OAuthErrorPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const error = searchParams.get("error");
  const message = searchParams.get("message");

  useEffect(() => {
    // Si aucun paramètre d'erreur, rediriger vers login
    if (!error && !message) {
      navigate("/login");
    }
  }, [error, message, navigate]);

  const getErrorTitle = () => {
    if (error === "registration_disabled") {
      return "Inscriptions temporairement désactivées";
    }
    return "Erreur de connexion";
  };

  const getErrorMessage = () => {
    if (message) {
      return message;
    }
    return "Une erreur s'est produite lors de la connexion via Google. Veuillez réessayer ultérieurement.";
  };

    return (
      <AuthStatusLayout>
        <AlertTriangle className="mx-auto mb-4 text-amber-300" size={30} />
        <h1 className="text-2xl font-bold">{getErrorTitle()}</h1>
        <p className="mb-6 mt-3 text-sm leading-6 text-gray-200">{getErrorMessage()}</p>
        <button onClick={() => navigate("/login")} className="w-full rounded-md bg-emerald-700 px-4 py-3 font-medium text-white transition hover:bg-emerald-600">
          Réessayer la connexion
        </button>
      </AuthStatusLayout>
    );
}