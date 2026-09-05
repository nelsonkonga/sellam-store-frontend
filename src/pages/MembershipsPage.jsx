import { useEffect, useState } from "react";
import { Users, Shield, ToggleLeft, ToggleRight, Trash2, X, Save } from "lucide-react";
import { useShop } from "../context/ShopContext";
import { getMembershipByShop, updateMembershipRole, toggleMembershipActive, deleteMembership, updateMembershipPermissions } from "../services/identityService";
import BottomNav from "../components/BottomNav";

const ROLES = [
  { value: "MANAGER", label: "Gérant" },
  { value: "CASHIER", label: "Caissier" },
  { value: "SECRETARY", label: "Secrétaire" },
];

const PERMISSIONS = [
  ["VIEW_PRODUCTS", "Voir les produits"],
  ["EDIT_PRODUCTS", "Modifier les produits"],
  ["CREATE_INVOICE", "Créer des factures"],
  ["EDIT_INVOICE", "Modifier les factures"],
  ["VALIDATE_INVOICE", "Valider les factures"],
  ["VIEW_SALES_HISTORY", "Voir l'historique des ventes"],
  ["VIEW_DAILY_BALANCE", "Voir le bilan journalier"],
  ["MANAGE_DAILY_BALANCE", "Gérer le bilan journalier"],
  ["VIEW_REPORTS", "Voir les rapports"],
  ["MANAGE_CASH", "Gérer les caisses"],
  ["MANAGE_SHOP_SETTINGS", "Gérer les paramètres boutique"],
  ["USE_SUPPORT_CHAT", "Utiliser le chat support"],
];

function roleLabel(role) {
  return ROLES.find((item) => item.value === role)?.label || role;
}

function permissionState(permission, membership) {
  if (membership.revokedOverrides?.includes(permission)) return "revoked";
  if (membership.grantedOverrides?.includes(permission)) return "granted";
  if (membership.effectivePermissions?.includes(permission)) return "default";
  return "revoked";
}

export default function MembershipsPage() {
  const { selectedShopId: shopId } = useShop();
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [permissionsMembership, setPermissionsMembership] = useState(null);
  const [permissionsState, setPermissionsState] = useState({});
  const [savingPermissions, setSavingPermissions] = useState(false);

  const loadMemberships = async () => {
    if (!shopId) return;
    try {
      setLoading(true);
      const data = await getMembershipByShop(shopId);
      setMemberships(Array.isArray(data) ? data : [data].filter(Boolean));
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Impossible de charger les memberships.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMemberships();
  }, [shopId]);

  async function handleRoleChange(membershipId, role) {
    try {
      await updateMembershipRole(membershipId, role);
      await loadMemberships();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du changement de rôle.");
    }
  }

  async function handleToggleActive(membershipId) {
    try {
      await toggleMembershipActive(membershipId);
      await loadMemberships();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du changement de statut.");
    }
  }

  async function handleDelete(membershipId) {
    if (!window.confirm('Supprimer cette appartenance ?')) return;
    try {
      await deleteMembership(membershipId);
      await loadMemberships();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression.');
    }
  }

  function openPermissions(membership) {
    setPermissionsMembership(membership);
    setPermissionsState(
      Object.fromEntries(PERMISSIONS.map(([permission]) => [permission, permissionState(permission, membership)]))
    );
    setError("");
  }

  async function handleSavePermissions() {
    if (!permissionsMembership) return;
    setSavingPermissions(true);
    try {
      const grantedOverrides = Object.entries(permissionsState)
        .filter(([, state]) => state === "granted")
        .map(([permission]) => permission);
      const revokedOverrides = Object.entries(permissionsState)
        .filter(([, state]) => state === "revoked")
        .map(([permission]) => permission);

      await updateMembershipPermissions(permissionsMembership.id, { grantedOverrides, revokedOverrides });
      setPermissionsMembership(null);
      await loadMemberships();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la sauvegarde des permissions.");
    } finally {
      setSavingPermissions(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f1fcf5] pb-24 text-[#141e1a]">
      <header className="mx-auto max-w-7xl border-b border-[#bdc9c1] px-5 pb-6 pt-8 md:px-8 lg:px-10">
        <div className="flex items-center gap-3">
          <Users className="text-brand-400" size={28} />
          <div>
            <div><p className="text-xs font-bold uppercase tracking-[0.08em] text-[#006547]">Accès</p><h1 className="font-display text-3xl font-bold">Membres de la boutique</h1><p className="text-sm text-[#6e7a72]">Gestion des rôles et activations.</p></div>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-5 py-6 md:grid-cols-2 lg:grid-cols-3 md:px-8 lg:px-10">
        {error && <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-3 text-sm text-red-300">{error}</div>}

        {loading ? (
          <p className="text-center text-gray-400">Chargement...</p>
        ) : memberships.length === 0 ? (
          <div className="rounded-2xl glass p-5 text-center text-gray-400">Aucune appartenance pour cette boutique.</div>
        ) : (
          memberships.map((membership) => (
            <div key={membership.id} className="rounded-2xl glass p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{membership.shopName || 'Boutique'}</p>
                  <p className="text-xs text-gray-400">Personne #{membership.personId?.slice(0, 8) || '—'}</p>
                </div>

                <button onClick={() => handleToggleActive(membership.id)} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs">
                  {membership.active ? <ToggleRight size={16} className="text-emerald-400" /> : <ToggleLeft size={16} className="text-gray-400" />}
                  {membership.active ? 'Actif' : 'Inactif'}
                </button>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <label className="text-sm text-gray-300">Rôle</label>
                <select
                  value={membership.role}
                  onChange={(e) => handleRoleChange(membership.id, e.target.value)}
                  className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-white"
                >
                  {ROLES.map((role) => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
                <span className="text-xs text-gray-400">{roleLabel(membership.role)}</span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => openPermissions(membership)} className="flex items-center gap-2 rounded-xl border border-brand-400/40 bg-brand-400/10 px-3 py-2 text-xs text-brand-300">
                  <Shield size={14} /> Permissions
                </button>
                <button onClick={() => handleDelete(membership.id)} className="flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-950/20 px-3 py-2 text-xs text-red-300">
                  <Trash2 size={14} /> Supprimer
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(membership.effectivePermissions || []).slice(0, 5).map((permission) => (
                  <span key={permission} className="rounded-full bg-emerald-400/10 px-2 py-1 text-[10px] text-emerald-300">
                    {permission.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </main>

      {permissionsMembership && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setPermissionsMembership(null)}>
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl glass p-5" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Permissions par boutique</h2>
                <p className="text-sm text-gray-400">{permissionsMembership.shopName} · {roleLabel(permissionsMembership.role)}</p>
              </div>
              <button type="button" aria-label="Fermer" onClick={() => setPermissionsMembership(null)} className="rounded-lg p-2 hover:bg-white/10"><X size={18} /></button>
            </div>
            <p className="mt-3 text-xs text-gray-400">Par défaut suit le rôle. Les états Autoriser et Refuser sont des overrides pour cette boutique.</p>
            <div className="mt-4 space-y-2">
              {PERMISSIONS.map(([permission, label]) => (
                <div key={permission} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
                  <span className="text-sm text-white">{label}</span>
                  <div className="flex overflow-hidden rounded-lg border border-white/10">
                    {["default", "granted", "revoked"].map((state) => (
                      <button
                        key={state}
                        type="button"
                        onClick={() => setPermissionsState((current) => ({ ...current, [permission]: state }))}
                        className={`px-2 py-1.5 text-[10px] ${permissionsState[permission] === state ? "bg-brand-400 text-white" : "text-gray-300 hover:bg-white/10"}`}
                      >
                        {state === "default" ? "Par défaut" : state === "granted" ? "Autoriser" : "Refuser"}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex gap-2">
              <button type="button" onClick={() => setPermissionsMembership(null)} className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm">Annuler</button>
              <button type="button" onClick={handleSavePermissions} disabled={savingPermissions} className="flex-1 btn-gradient flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50">
                <Save size={15} /> {savingPermissions ? "Enregistrement..." : "Sauvegarder"}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
