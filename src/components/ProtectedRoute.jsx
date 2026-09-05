import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useShop } from "../context/ShopContext";
import EmailVerificationBanner from "./EmailVerificationBanner";
import AppShell from "./AppShell";

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
export default function ProtectedRoute({ children, requireShop = true, requireManager = false }) {
  const { isAuthenticated, isManager } = useAuth();
  const { selectedShopId } = useShop();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
          reason: "login_required",
          message: "Connectez-vous pour accéder à cette page.",
        }}
      />
    );
  }

  if (requireManager && !isManager) {
    return (
      <Navigate
        to="/dashboard"
        replace
        state={{
          from: location,
          reason: "forbidden",
          message: "Cette page est réservée aux comptes autorisés.",
        }}
      />
    );
  }

  const isShopsPage = location.pathname === "/shops";

  if (requireShop && !selectedShopId && !isShopsPage) {
    return (
      <Navigate
        to="/shops"
        replace
        state={{
          from: location,
          reason: "shop_required",
          message: "Sélectionnez ou créez une boutique pour continuer.",
        }}
      />
    );
  }

  return (
      <AppShell>
        <EmailVerificationBanner />
        {children}
      </AppShell>
  );
}