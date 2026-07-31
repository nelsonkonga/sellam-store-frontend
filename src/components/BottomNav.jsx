import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
} from "lucide-react";

// Liste des onglets, centralisée ici pour être facile à faire évoluer.
// "Ventes" pointe vers /sales/new (vente rapide) et "Bilan" vers /balance,
// conformément aux routes définies dans App.jsx.
const TABS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/products", label: "Produits", icon: Package },
  { to: "/sales/new", label: "Ventes", icon: ShoppingCart },
  { to: "/balance", label: "Bilan", icon: BarChart3 },
  { to: "/settings/profile", label: "Paramètres", icon: Settings },
];

/**
 * Barre de navigation basse fixe, pensée pour le pouce sur mobile.
 * Utilise NavLink pour surligner automatiquement l'onglet actif selon la route courante.
 */
export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around
                 border-t border-gray-100 bg-white py-2
                 dark:border-gray-800 dark:bg-gray-900"
    >
      {TABS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-1 py-1 text-[11px] font-medium transition ${
              isActive
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-gray-400 dark:text-gray-500"
            }`
          }
        >
          <Icon size={22} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
