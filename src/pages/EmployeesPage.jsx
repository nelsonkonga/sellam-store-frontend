import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, UserPlus, Search, Edit3, Trash2, ToggleLeft, ToggleRight,
  Phone, Shield, ShieldCheck, ShieldAlert, KeyRound, X, ChevronDown
} from "lucide-react";
import {
  listEmployees, createEmployee, updateEmployee,
  changeEmployeePassword, toggleEmployeeActive, deleteEmployee
} from "../services/employeeService";
import { useShop } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";
import BottomNav from "../components/BottomNav";

const ROLES = [
  { value: "MANAGER", label: "Gérant", icon: ShieldCheck, color: "text-emerald-400" },
  { value: "CASHIER", label: "Caissier", icon: Shield, color: "text-blue-400" },
  { value: "SECRETARY", label: "Secrétaire", icon: ShieldAlert, color: "text-amber-400" },
];

function getRoleInfo(role) {
  return ROLES.find(r => r.value === role) || ROLES[1];
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({ name: "", phoneNumber: "", password: "", role: "CASHIER" });
  const [newPassword, setNewPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const { selectedShopId: shopId } = useShop();
  const { isManager } = useAuth();

  const fetchEmployees = useCallback(async () => {
    if (!shopId) return;
    try {
      setLoading(true);
      const data = await listEmployees(shopId);
      setEmployees(data);
      setError("");
    } catch (err) {
      setError("Impossible de charger la liste des employés.");
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  useEffect(() => {
    if (!shopId) { navigate("/shops"); return; }
    fetchEmployees();
  }, [shopId, navigate, fetchEmployees]);

  const filtered = employees.filter(e =>
    e.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.phoneNumber?.includes(search)
  );

  function openCreateForm() {
    setEditingEmployee(null);
    setFormData({ name: "", phoneNumber: "", password: "", role: "CASHIER" });
    setShowForm(true);
  }

  function openEditForm(emp) {
    setEditingEmployee(emp);
    setFormData({ name: emp.name, phoneNumber: emp.phoneNumber, password: "", role: emp.role });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingEmployee(null);
    setFormData({ name: "", phoneNumber: "", password: "", role: "CASHIER" });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingEmployee) {
        await updateEmployee(editingEmployee.id, {
          name: formData.name,
          phoneNumber: formData.phoneNumber,
          role: formData.role,
        });
      } else {
        await createEmployee(shopId, formData);
      }
      closeForm();
      fetchEmployees();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || "Erreur lors de l'enregistrement.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleActive(emp) {
    try {
      await toggleEmployeeActive(emp.id);
      fetchEmployees();
    } catch (err) {
      setError("Erreur lors du changement de statut.");
    }
  }

  async function handleChangePassword() {
    if (!newPassword || newPassword.length < 4) { setError("Le mot de passe doit contenir au moins 4 caractères."); return; }
    setSubmitting(true);
    try {
      await changeEmployeePassword(showPasswordModal.id, newPassword);
      setShowPasswordModal(null);
      setNewPassword("");
    } catch (err) {
      setError("Erreur lors du changement de mot de passe.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    setSubmitting(true);
    try {
      await deleteEmployee(showDeleteConfirm.id);
      setShowDeleteConfirm(null);
      fetchEmployees();
    } catch (err) {
      setError("Erreur lors de la suppression.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-hero-gradient text-white pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 glass-nav px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users size={24} className="text-brand-400" />
            <h1 className="text-lg font-bold">Équipe</h1>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium">
              {employees.length} employé{employees.length !== 1 ? "s" : ""}
            </span>
          </div>
          {isManager && (
            <button
              onClick={openCreateForm}
              className="btn-gradient flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold"
            >
              <UserPlus size={16} />
              Ajouter
            </button>
          )}
        </div>

        {/* Search */}
        <div className="mt-3 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un employé…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl bg-white/5 border border-white/10 py-2.5 pl-9 pr-4 text-sm text-white placeholder-gray-500 focus:border-brand-400 focus:outline-none transition"
          />
        </div>
      </header>

      {/* Content */}
      <main className="px-4 pt-4 space-y-3">
        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-300 flex items-center justify-between">
            {error}
            <button onClick={() => setError("")} className="text-red-400 hover:text-red-300"><X size={16} /></button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-2 border-brand-400/30 border-t-brand-400 rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Chargement…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <Users size={48} className="text-gray-600" />
            <p className="text-gray-400">
              {search ? "Aucun employé trouvé pour cette recherche." : "Aucun employé pour le moment."}
            </p>
            {isManager && !search && (
              <button onClick={openCreateForm} className="btn-gradient rounded-xl px-4 py-2 text-sm font-semibold mt-2">
                Ajouter le premier employé
              </button>
            )}
          </div>
        ) : (
          filtered.map(emp => {
            const role = getRoleInfo(emp.role);
            const RoleIcon = role.icon;
            return (
              <div
                key={emp.id}
                className={`glass rounded-2xl p-4 transition-all duration-200 ${!emp.active ? "opacity-50" : ""}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar */}
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${
                      emp.active ? "bg-gradient-to-br from-brand-400 to-purple-500" : "bg-gray-600"
                    }`}>
                      {emp.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-white truncate">{emp.name}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                        <Phone size={12} />
                        <span>{emp.phoneNumber}</span>
                      </div>
                    </div>
                  </div>

                  {/* Role badge */}
                  <div className={`flex items-center gap-1 rounded-lg bg-white/5 border border-white/10 px-2 py-1 text-xs font-medium ${role.color}`}>
                    <RoleIcon size={12} />
                    {role.label}
                  </div>
                </div>

                {/* Status + Actions */}
                {isManager && (
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${emp.active ? "bg-emerald-400" : "bg-red-400"}`} />
                      <span className={`text-xs ${emp.active ? "text-emerald-400" : "text-red-400"}`}>
                        {emp.active ? "Actif" : "Désactivé"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleActive(emp)}
                        className="p-2 rounded-lg hover:bg-white/10 transition"
                        title={emp.active ? "Désactiver" : "Activer"}
                      >
                        {emp.active ? <ToggleRight size={18} className="text-emerald-400" /> : <ToggleLeft size={18} className="text-gray-400" />}
                      </button>
                      <button
                        onClick={() => openEditForm(emp)}
                        className="p-2 rounded-lg hover:bg-white/10 transition"
                        title="Modifier"
                      >
                        <Edit3 size={16} className="text-blue-400" />
                      </button>
                      <button
                        onClick={() => { setShowPasswordModal(emp); setNewPassword(""); }}
                        className="p-2 rounded-lg hover:bg-white/10 transition"
                        title="Changer le mot de passe"
                      >
                        <KeyRound size={16} className="text-amber-400" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(emp)}
                        className="p-2 rounded-lg hover:bg-white/10 transition"
                        title="Supprimer"
                      >
                        <Trash2 size={16} className="text-red-400" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </main>

      {/* Modal: Create/Edit employee */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm" onClick={closeForm}>
          <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl glass p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">{editingEmployee ? "Modifier l'employé" : "Nouvel employé"}</h2>
              <button onClick={closeForm} className="p-1.5 rounded-lg hover:bg-white/10 transition"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Nom complet</label>
                <input
                  type="text" required
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-xl bg-white/5 border border-white/10 py-2.5 px-3 text-sm text-white focus:border-brand-400 focus:outline-none transition"
                  placeholder="Ex: Amadou Diallo"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Numéro de téléphone</label>
                <input
                  type="tel" required
                  value={formData.phoneNumber}
                  onChange={e => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  className="w-full rounded-xl bg-white/5 border border-white/10 py-2.5 px-3 text-sm text-white focus:border-brand-400 focus:outline-none transition"
                  placeholder="Ex: 6XXXXXXXX"
                />
              </div>
              {!editingEmployee && (
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Mot de passe</label>
                  <input
                    type="password" required
                    value={formData.password}
                    onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full rounded-xl bg-white/5 border border-white/10 py-2.5 px-3 text-sm text-white focus:border-brand-400 focus:outline-none transition"
                    placeholder="Mot de passe de l'employé"
                    minLength={4}
                  />
                </div>
              )}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Rôle</label>
                <div className="grid grid-cols-3 gap-2">
                  {ROLES.map(role => {
                    const RoleIcon = role.icon;
                    const isSelected = formData.role === role.value;
                    return (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, role: role.value }))}
                        className={`flex flex-col items-center gap-1.5 rounded-xl p-3 text-xs font-medium transition border ${
                          isSelected
                            ? "bg-brand-400/20 border-brand-400 text-brand-400"
                            : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                        }`}
                      >
                        <RoleIcon size={20} />
                        {role.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-gradient rounded-xl py-3 text-sm font-semibold disabled:opacity-50 transition"
              >
                {submitting ? "Enregistrement…" : (editingEmployee ? "Enregistrer les modifications" : "Créer l'employé")}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Change password */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowPasswordModal(null)}>
          <div className="w-full max-w-sm rounded-3xl glass p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-1">Changer le mot de passe</h2>
            <p className="text-sm text-gray-400 mb-4">Pour <span className="text-white font-medium">{showPasswordModal.name}</span></p>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Nouveau mot de passe"
              minLength={4}
              className="w-full rounded-xl bg-white/5 border border-white/10 py-2.5 px-3 text-sm text-white focus:border-brand-400 focus:outline-none transition mb-4"
            />
            <div className="flex gap-2">
              <button onClick={() => setShowPasswordModal(null)} className="flex-1 rounded-xl bg-white/5 border border-white/10 py-2.5 text-sm font-medium hover:bg-white/10 transition">Annuler</button>
              <button onClick={handleChangePassword} disabled={submitting} className="flex-1 btn-gradient rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50">
                {submitting ? "…" : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Delete confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(null)}>
          <div className="w-full max-w-sm rounded-3xl glass p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-1 text-red-400">Supprimer l'employé</h2>
            <p className="text-sm text-gray-400 mb-4">
              Es-tu sûr de vouloir supprimer <span className="text-white font-medium">{showDeleteConfirm.name}</span> ?
              Cette action est irréversible.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 rounded-xl bg-white/5 border border-white/10 py-2.5 text-sm font-medium hover:bg-white/10 transition">Annuler</button>
              <button onClick={handleDelete} disabled={submitting} className="flex-1 rounded-xl bg-red-500/20 border border-red-500/30 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/30 disabled:opacity-50 transition">
                {submitting ? "…" : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
