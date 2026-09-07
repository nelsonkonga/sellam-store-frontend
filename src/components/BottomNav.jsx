import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  FileText,
  Users,
  LifeBuoy,
  WalletCards,
  Menu,
  X
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

// Onglets principaux affichés directement dans la barre — on en garde
// volontairement peu (5 max) pour que chaque icône/label reste lisible
// et facilement cliquable au pouce sur un petit écran.
const MAIN_TABS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/products", label: "Produits", icon: Package },
  { to: "/sales/new", label: "Ventes", icon: ShoppingCart },
  { to: "/invoices", label: "Factures", icon: FileText },
  { to: "/cash", label: "Caisses", icon: BarChart3, managerOnly: true },
];

// Tout ce qui ne rentre pas dans la barre principale part dans le tiroir
// "Plus", pour ne plus jamais laisser une page sans accès sur mobile
// (c'était le cas d'Abonnement et du Centre d'aide, absents de la barre
// et de la sidebar desktop qui est masquée en dessous de lg).
const MORE_LINKS = [
  { to: "/employees", label: "Équipe", icon: Users, managerOnly: true },
  { to: "/memberships", label: "Membres", icon: Users, managerOnly: true },
  { to: "/subscription", label: "Abonnement", icon: WalletCards },
  { to: "/support", label: "Centre d'aide", icon: LifeBuoy },
  { to: "/settings/profile", label: "Paramètres", icon: Settings },
];

/**
 * Barre de navigation basse fixe, pensée pour le pouce sur mobile.
 * Utilise NavLink pour surligner automatiquement l'onglet actif selon la route courante.
 *
 * La barre elle-même reste volontairement courte (5 onglets + "Plus") pour
 * rester lisible ; tout le reste (Abonnement, Support, Équipe, Membres,
 * Paramètres) est accessible depuis le tiroir "Plus", qui remplace
 * l'ancienne sidebar desktop absente sur mobile.
 */
export default function BottomNav() {
  const { isManager } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);

  const tabs = MAIN_TABS.filter((tab) => !tab.managerOnly || isManager);
  const moreLinks = MORE_LINKS.filter((link) => !link.managerOnly || isManager);

  return (
    <>
      {/*
        fixed + bottom-0 seuls ne suffisent pas si un ancêtre applique un
        transform (ex: une animation d'entrée de page) : cela crée un
        nouveau containing block et la nav se met à scroller avec le
        contenu au lieu de rester clouée au viewport. BottomNav doit donc
        être montée une seule fois, au niveau du shell applicatif
        (AppShell), en dehors de tout conteneur animé/transformé — jamais
        réimportée dans chaque page individuelle.
        pb-[env(safe-area-inset-bottom)] évite que la barre soit rognée
        par la zone gestuelle des iPhone récents.
      */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex items-stretch justify-around
                   border-t border-[#bdc9c1] bg-[#f1fcf5] pt-2
                   pb-[calc(env(safe-area-inset-bottom)+0.5rem)] lg:hidden"
      >
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center justify-center gap-1 py-1 text-[11px] font-medium transition ${
                isActive ? "text-[#006547]" : "text-[#6e7a72]"
              }`
            }
          >
            <Icon size={22} />
            {label}
          </NavLink>
        ))}

        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          aria-label="Plus d'options"
          aria-haspopup="true"
          aria-expanded={moreOpen}
          className="flex flex-1 flex-col items-center justify-center gap-1 py-1 text-[11px] font-medium text-[#6e7a72] transition hover:text-[#006547]"
        >
          <Menu size={22} />
          Plus
        </button>
      </nav>

      {moreOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-[#141e1a]/40 lg:hidden"
          onClick={() => setMoreOpen(false)}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Plus d'options de navigation"
            className="w-full rounded-t-2xl bg-white p-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Plus</h2>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                aria-label="Fermer"
                className="rounded-lg p-1.5 text-[#6e7a72] hover:bg-[#ebf6ef] hover:text-[#141e1a]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-1">
              {moreLinks.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMoreOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition ${
                      isActive ? "bg-[#ddf4ea] text-[#006547]" : "text-[#141e1a] hover:bg-[#ebf6ef]"
                    }`
                  }
                >
                  <Icon size={19} />
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}