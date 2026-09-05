import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { 
  FileText, 
  LayoutDashboard, 
  LifeBuoy, 
  LogOut, 
  Package, 
  Settings, 
  ShoppingCart, 
  Store, 
  Users, 
  Receipt,   // Pour les Rapports (Factures/Stats)
  Wallet,    // Pour les Caisses (Argent/Sessions)
  UserCheck  // Pour les Membres et accès (Rôles/Permissions)
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useShop } from "../context/ShopContext";
import SyncStatus from "./SyncStatus";

const operationalLinks = [
  ["/dashboard", "Aujourd'hui", LayoutDashboard],
  ["/sales/new", "Nouvelle vente", ShoppingCart],
  ["/products", "Produits", Package],
  ["/invoices", "Factures", FileText],
];

// Changement des icônes ici pour supprimer la redondance
const managementLinks = [
  ["/reports", "Rapports", Receipt],
  ["/cash", "Caisses", Wallet, true],
  ["/employees", "Équipe", Users, true],
  ["/memberships", "Membres et accès", UserCheck, true],
];

function ShellLink({ to, label, Icon }) {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => 
        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
          isActive 
            ? "bg-[#12805c] font-bold text-white" 
            : "font-medium text-[var(--text-secondary)] hover:bg-[#ebf6ef] hover:text-[#006547]"
        }`
      }
    >
      <Icon size={18} />
      <span>{label}</span>
    </NavLink>
  );
}

export default function AppShell({ children }) {
  const { isManager, name, logout } = useAuth();
  const { selectedShopName } = useShop();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Filtre les liens selon le rôle
  const links = [...operationalLinks, ...managementLinks].filter(([, , , managerOnly]) => !managerOnly || isManager);

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col overflow-y-auto border-r border-[var(--border-soft)] bg-white px-4 py-6 lg:flex">
        <button type="button" onClick={() => navigate("/dashboard")} className="mb-7 flex items-center gap-3 px-2 text-left">
          <img 
  src="/sellam-logo.png" 
  alt="Logo Sellam" 
  className="h-8 w-8 object-contain" 
  onError={(e) => {
    // Sécurité : si l'image ne charge pas, on remet le macaron vert "S"
    e.currentTarget.style.display = 'none';
    const fallback = document.createElement('span');
    fallback.className = "flex h-8 w-8 items-center justify-center rounded-full bg-[#12805c] text-lg font-bold text-white";
    fallback.innerText = "S";
    e.currentTarget.parentNode.insertBefore(fallback, e.currentTarget);
  }}
/>

          <span>
            <strong className="block font-display text-lg font-bold text-[#006547]">Sellam</strong>
            <span className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">Gestion de Boutiques</span>
          </span>
        </button>
        
        <button type="button" onClick={() => navigate("/sales/new")} className="mb-4 flex items-center justify-center gap-2 rounded-xl bg-[#12805c] px-3 py-3 text-xs font-bold uppercase tracking-[0.06em] text-white transition hover:bg-[#006547]">
          <ShoppingCart size={16} /> Nouvelle vente
        </button>
        
        <button type="button" onClick={() => navigate("/shops")} className="mb-5 flex items-center gap-2 rounded-xl border border-[var(--border-soft)] bg-[#f1fcf5] px-3 py-2.5 text-left text-sm hover:bg-[#ebf6ef]">
          <Store size={16} className="text-emerald-700 dark:text-emerald-300" />
          <span className="min-w-0 flex-1 truncate">{selectedShopName || "Choisir une boutique"}</span>
        </button>
        
        <nav className="flex flex-1 flex-col gap-1" aria-label="Navigation principale">
          <p className="mb-1 mt-1 px-3 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">Opérations</p>
          {links.slice(0, 4).map(([to, label, Icon]) => <ShellLink key={to} to={to} label={label} Icon={Icon} />)}
          
          <p className="mb-1 mt-5 px-3 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">Pilotage et équipe</p>
          {links.slice(4).map(([to, label, Icon]) => <ShellLink key={to} to={to} label={label} Icon={Icon} />)}
          
          <p className="mb-1 mt-5 px-3 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">Espace</p>
          <ShellLink to="/support" label="Centre d'aide" Icon={LifeBuoy} />
          <ShellLink to="/settings/profile" label="Paramètres" Icon={Settings} />
        </nav>
        
        <div className="border-t border-[var(--border-soft)] pt-4">
          <SyncStatus />
          <div className="mt-3 flex items-center justify-between gap-2">
            <button type="button" onClick={() => navigate("/settings/profile")} className="min-w-0 truncate text-left text-sm font-semibold hover:text-emerald-700 dark:hover:text-emerald-300">
              {name || "Mon profil"}
              <span className="block text-xs font-normal text-[var(--text-muted)]">{isManager ? "Gérant" : "Membre"}</span>
            </button>
            <button type="button" onClick={() => { logout(); navigate("/login"); }} aria-label="Se déconnecter" title="Se déconnecter" className="rounded-md p-2 text-[var(--text-muted)] hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40">
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>
      
      <main className="min-h-screen lg:pl-64">
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 lg:hidden dark:border-amber-900/50 dark:bg-amber-950/30">
          <SyncStatus />
        </div>
        <div key={location.pathname} className="min-h-screen animate-fade-in-up">{children}</div>
      </main>
    </div>
  );
}
