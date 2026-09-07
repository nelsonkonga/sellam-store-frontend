import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowRight, CheckCircle2, CircleHelp, Clock3, Plus, Search, ShoppingCart, WalletCards } from "lucide-react";
import supportService from "../services/supportService";
import AttachmentUploader from "../components/AttachmentUploader";


const categories = [
  ["TECHNICAL", "Problème avec une vente", "Remboursements, échanges, reçus ou erreur de transaction.", ShoppingCart, "bg-[#fff4ed] text-[#9f6300]"],
  ["BILLING", "Problème de caisse", "Tiroir-caisse, TPE hors ligne ou impression de ticket.", WalletCards, "bg-[#eaf4fc] text-[#116875]"],
  ["ACCOUNT", "Mon compte", "Accès employés, mot de passe et paramètres du compte.", CircleHelp, "bg-[#ddf4ea] text-[#006547]"],
];
const statusLabels = { OPEN: "Ouvert", IN_PROGRESS: "En cours", WAITING_FOR_USER: "En attente", RESOLVED: "Résolu", CLOSED: "Fermé" };
const statusTones = { OPEN: "bg-[#eaf4fc] text-[#116875]", IN_PROGRESS: "bg-[#eaf4fc] text-[#116875]", WAITING_FOR_USER: "bg-[#fff4ed] text-[#9f6300]", RESOLVED: "bg-[#ddf4ea] text-[#006547]", CLOSED: "bg-[#eef2ef] text-[#58655e]" };

export default function UserSupportPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ subject: "", category: "ACCOUNT", priority: "MEDIUM", initialMessage: "" });
  const [attachments, setAttachments] = useState([]);

  async function loadTickets() {
    try { setTickets(await supportService.listMyTickets()); setError(""); }
    catch (err) { setError(err.response?.data?.message || "Impossible de charger vos tickets."); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadTickets(); }, []);

  // Pré-remplit et ouvre automatiquement le formulaire de création quand on
  // arrive depuis un lien contextuel (ex: "Envoyer ma preuve de paiement au
  // support" depuis la page Abonnement), au lieu de renvoyer vers une route
  // /support/tickets/new qui n'existe pas. On consomme le state tout de
  // suite pour qu'il ne survive pas à un refresh ou un retour arrière.
  useEffect(() => {
    if (!location.state?.prefillTicket) return;
    const { subject, category, priority, initialMessage } = location.state.prefillTicket;
    setForm((current) => ({
      ...current,
      subject: subject || current.subject,
      category: category || current.category,
      priority: priority || current.priority,
      initialMessage: initialMessage || current.initialMessage,
    }));
    setCreating(true);
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.state, location.pathname, navigate]);

  const autuFocusRef = useRef(null);

// Force le focus dès que le modal s'ouvre ('creating' devient vrai)
useEffect(() => {
  if (creating) {
    // Un léger timeout de 50ms laisse le temps au modal de s'animer et d'apparaître dans le DOM
    setTimeout(() => {
      autuFocusRef.current?.focus();
    }, 50);
  }
}, [creating]);


async function submit(event) {
  event.preventDefault();
  try {
    setLoading(true);
    await supportService.createTicket({
      ...form,
      subject: form.subject.trim(),
      initialMessage: form.initialMessage.trim(),
      attachmentUrls: attachments.map((a) => a.url),
    });
    setForm({ subject: "", category: "ACCOUNT", priority: "MEDIUM", initialMessage: "" });
    setAttachments([]);
    setCreating(false);
    await loadTickets();
  } catch (err) { setError(err.response?.data?.message || "Impossible de créer le ticket."); setLoading(false); }
}

  const visibleTickets = tickets.filter((ticket) => ticket.subject?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)]">
      <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between gap-5 border-b border-[#bdc9c1] bg-[#f1fcf5]/95 px-5 py-3 backdrop-blur md:px-8">
        <div className="relative hidden w-full max-w-md md:block"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6e7a72]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher dans le support..." className="w-full rounded-lg border border-[#bdc9c1] bg-white py-2 pl-10 pr-4 text-sm outline-none focus:border-[#006547]" /></div>
        <div className="ml-auto flex items-center gap-3 text-sm font-bold text-[#3e4943]"><span className="hidden sm:block">Centre d'aide</span><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#006547] text-white">?</span></div>
      </header>
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-8 md:px-8 lg:px-10">
        <section><p className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-[#006547]">Espace assistance</p><h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Centre de Support</h1><p className="mt-2 max-w-2xl text-base text-[#3e4943]">Comment pouvons-nous vous aider aujourd'hui ? Recherchez une solution ou contactez notre équipe.</p><div className="relative mt-5 md:hidden"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6e7a72]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un sujet..." className="w-full rounded-lg border border-[#bdc9c1] bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-[#006547]" /></div></section>
        {error && <div role="alert" className="flex items-center gap-2 rounded-lg border border-[#e9aaa2] bg-[#fff0ee] p-3 text-sm text-[#93000a]"><AlertCircle size={18} />{error}</div>}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">{categories.map(([value, title, description, Icon, tone]) => <button key={value} type="button" onClick={() => { setForm((current) => ({ ...current, category: value, subject: title })); setCreating(true); }} className="group flex min-h-48 flex-col items-start rounded-xl border border-[#bdc9c1] bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-[#006547] hover:shadow-md"><span className={`mb-5 flex h-10 w-10 items-center justify-center rounded-lg ${tone}`}><Icon size={22} /></span><h2 className="font-display text-lg font-semibold">{title}</h2><p className="mt-2 text-sm leading-5 text-[#3e4943]">{description}</p><ArrowRight size={17} className="mt-auto text-[#006547] opacity-0 transition group-hover:opacity-100" /></button>)}</section>
        <section><div className="mb-3 flex flex-col gap-3 border-b border-[#bdc9c1] pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="font-display text-xl font-semibold">Vos tickets récents</h2><p className="mt-1 text-sm text-[#6e7a72]">Suivez les demandes ouvertes auprès de notre équipe.</p></div><button type="button" onClick={() => setCreating(true)} className="hidden items-center gap-2 rounded-lg bg-[#006547] px-4 py-2.5 text-sm font-bold text-white sm:flex"><Plus size={17} />Nouveau ticket</button></div>{loading && !tickets.length ? <div className="rounded-xl border border-[#bdc9c1] bg-white p-10 text-center text-sm text-[#6e7a72]">Chargement des tickets...</div> : !visibleTickets.length ? <div className="rounded-xl border border-[#bdc9c1] bg-white p-10 text-center"><CheckCircle2 className="mx-auto mb-3 text-[#006547]" size={30} /><p className="font-semibold">Aucun ticket à afficher</p><p className="mt-1 text-sm text-[#6e7a72]">Créez une demande si vous avez besoin d'assistance.</p></div> : <div className="overflow-hidden rounded-xl border border-[#bdc9c1] bg-white"><div className="hidden grid-cols-12 gap-4 border-b border-[#bdc9c1] bg-[#ebf6ef] p-4 text-[11px] font-bold uppercase tracking-[0.08em] text-[#6e7a72] md:grid"><span className="col-span-1">ID</span><span className="col-span-6">Sujet</span><span className="col-span-2">Statut</span><span className="col-span-3 text-right">Mise à jour</span></div>{visibleTickets.map((ticket) => <button key={ticket.id} type="button" onClick={() => navigate(`/support/tickets/${ticket.id}`)} className="grid w-full grid-cols-1 gap-2 border-b border-[#bdc9c1] p-4 text-left transition last:border-0 hover:bg-[#ebf6ef] md:grid-cols-12 md:items-center md:gap-4"><span className="font-mono text-xs text-[#6e7a72] md:col-span-1">#{ticket.id?.slice(0, 8)}</span><span className="font-semibold md:col-span-6">{ticket.subject}<small className="mt-1 block font-normal text-[#6e7a72] md:hidden">{statusLabels[ticket.status] || ticket.status}</small></span><span className={`w-fit rounded px-2 py-1 text-xs font-bold md:col-span-2 ${statusTones[ticket.status] || statusTones.CLOSED}`}>{statusLabels[ticket.status] || ticket.status}</span><span className="flex items-center gap-1 text-xs text-[#6e7a72] md:col-span-3 md:justify-end"><Clock3 size={13} />{ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleDateString("fr-FR") : "-"}</span></button>)}</div>}</section>
      </main>
      {creating && <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#141e1a]/40 p-4" onClick={() => setCreating(false)}><form onSubmit={submit} onClick={(event) => event.stopPropagation()} className="w-full max-w-lg rounded-xl border border-[#bdc9c1] bg-white p-6 shadow-xl"><p className="text-xs font-bold uppercase tracking-[0.08em] text-[#006547]">Nouvelle demande</p><h2 className="mt-1 font-display text-2xl font-semibold">Ouvrir un ticket</h2><div className="mt-5 space-y-4"><input ref={autuFocusRef} required value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} placeholder="Sujet" className="w-full rounded-lg border border-[#bdc9c1] px-3 py-3 text-sm outline-none focus:border-[#006547]" /><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="w-full rounded-lg border border-[#bdc9c1] bg-white px-3 py-3 text-sm"><option value="ACCOUNT">Mon compte</option><option value="BILLING">Facturation</option><option value="TECHNICAL">Problème technique</option><option value="OTHER">Autre</option></select><select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })} className="w-full rounded-lg border border-[#bdc9c1] bg-white px-3 py-3 text-sm"><option value="LOW">Priorité basse</option><option value="MEDIUM">Priorité moyenne</option><option value="HIGH">Priorité haute</option><option value="CRITICAL">Priorité critique</option></select>
      <textarea required rows={5} value={form.initialMessage} onChange={(event) => setForm({ ...form, initialMessage: event.target.value })} placeholder="Décrivez votre problème..." className="w-full resize-none rounded-lg border border-[#bdc9c1] px-3 py-3 text-sm outline-none focus:border-[#006547]" />
         <AttachmentUploader value={attachments} onChange={setAttachments} /> </div><button disabled={loading} className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[#006547] py-3 text-sm font-bold text-white disabled:opacity-50"><Plus size={17} />Envoyer la demande</button></form></div>}
    
    </div>
  );
}