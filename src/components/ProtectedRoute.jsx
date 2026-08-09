import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useShop } from "../context/ShopContext";
import EmailVerificationBanner from "./EmailVerificationBanner";

/**
 * Protège une route :
 * 1. Si l'utilisateur n'est pas authentifié → redirige vers /login.
 * 2. Sinon, si aucune boutique n'est sélectionnée → redirige vers /shops
 *    (sauf si on est déjà sur /shops, pour ne pas boucler).
 * 3. Sinon, affiche la route demandée.
 *
 * `requireShop` peut être mis à false pour une route protégée qui n'a pas
 * besoin d'une boutique sélectionnée (ex: /shops elle-même).
 */
export default function ProtectedRoute({ children, requireShop = true }) {
  const { isAuthenticated } = useAuth();
  const { selectedShopId } = useShop();
  const location = useLocation();

  if (!isAuthenticated) {
    // On garde la page visée en state, pour pouvoir y renvoyer après connexion si besoin
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const isShopsPage = location.pathname === "/shops";

  if (requireShop && !selectedShopId && !isShopsPage) {
    return <Navigate to="/shops" replace />;
  }

  return (
      <>
        <EmailVerificationBanner />
        {children}
      </>
  );
}