import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BarChart3, CheckCircle2, Menu, ShieldCheck, ShoppingCart, Store, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

const roles = [
  {
    title: "Le Gérant",
    description: "Vision globale en temps réel. Suivez les marges, analysez les tendances et prenez des décisions éclairées avec des rapports limpides.",
    image: "/gerant-sellam.png",
    items: ["Tableaux de bord dynamiques", "Export comptable simplifié"],
  },
  {
    title: "Le Caissier",
    description: "L'efficacité avant tout. Une caisse rapide, intuitive et conçue pour limiter les erreurs lors des pics d'affluence.",
    image: "/caisse-sellam.png",
    items: ["Interface tactile optimisée", "Gestion des retours en 2 clics"],
  },
  {
    title: "Responsable Stock",
    description: "La rigueur sans la douleur. Inventaires fluides, alertes de rupture et valorisation du stock en un coup d'œil.",
    image: "/stck-sellam.png",
    items: ["Scan code-barres intégré", "Alertes de seuil bas"],
  },
];

const proofPoints = [
  [ShoppingCart, "Mode Hors-Ligne", "Encaissez même sans internet."],
  [Store, "Multi-Boutiques", "Gérez votre réseau depuis un seul écran."],
  [ShieldCheck, "Permissions d'Équipe", "Accès sur-mesure pour chaque rôle."],
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate("/shops", { replace: true });
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) return null;

  const go = (path) => { setMenuOpen(false); navigate(path); };

  return (
    <div className="min-h-screen bg-[#f1fcf5] text-[#141e1a]">
      <nav className="sticky top-0 z-50 border-b border-[#bdc9c1] bg-[#f1fcf5]/95 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 md:px-8 lg:px-10">
<div className="flex items-center gap-3">
  <img 
    src="/sellam-logo.png" 
    alt="Logo Sellam" 
    className="h-24 w-24 object-contain shrink-0" 
    onError={(e) => {
      // Sécurité : si l'image ne charge pas, on remet le macaron vert "S"
      e.currentTarget.style.display = 'none';
      const fallback = document.createElement('span');
      fallback.className = "flex h-24 w-24 items-center justify-center rounded-full bg-[#12805c] text-3xl font-bold text-white shrink-0";
      fallback.innerText = "S";
      e.currentTarget.parentNode.insertBefore(fallback, e.currentTarget);
    }}
  />
  <a href="#hero" className="font-display text-4xl font-extrabold tracking-tight text-[#006547] leading-none">
    Sellam
  </a>
</div>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-[#3e4943] hover:text-[#006547]">Fonctionnalités</a>
            <a href="#roles" className="text-sm text-[#3e4943] hover:text-[#006547]">Pour votre équipe</a>
            <button type="button" onClick={() => go("/login")} className="text-sm font-semibold text-[#006547]">Connexion</button>
            <button type="button" onClick={() => go("/register")} className="rounded-lg bg-[#12805c] px-5 py-3 text-sm font-bold text-white hover:bg-[#006547]">Ouvrir mon espace</button>
          </div>
          <button type="button" onClick={() => setMenuOpen(!menuOpen)} className="text-[#006547] md:hidden" aria-label="Menu">{menuOpen ? <X /> : <Menu />}</button>
        </div>
        {menuOpen && <div className="border-t border-[#bdc9c1] bg-white px-5 py-5 md:hidden"><div className="flex flex-col gap-4 text-sm"><a href="#features" onClick={() => setMenuOpen(false)}>Fonctionnalités</a><a href="#roles" onClick={() => setMenuOpen(false)}>Pour votre équipe</a><button type="button" onClick={() => go("/login")} className="text-left font-semibold text-[#006547]">Connexion</button><button type="button" onClick={() => go("/register")} className="rounded-lg bg-[#12805c] px-4 py-3 text-left font-bold text-white">Ouvrir mon espace</button></div></div>}
      </nav>

      <main>
        <section id="hero" className="relative overflow-hidden py-16 md:py-24">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-5 md:px-8 lg:grid-cols-2 lg:gap-16 lg:px-10">
            <div className="flex flex-col gap-6">
              <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">La boutique avance.<br /><span className="text-[#12805c]">Vous gardez le contrôle.</span></h1>
              <p className="max-w-xl text-lg leading-8 text-[#3e4943]">Un système d'encaissement moderne qui lie vos ventes, vos stocks et votre équipe dans une harmonie parfaite. L'énergie du commerce, la sérénité de la gestion.</p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={() => go("/register")} className="flex items-center justify-center gap-2 rounded-lg bg-[#12805c] px-6 py-4 text-base font-bold text-white shadow-sm hover:bg-[#006547]">Ouvrir mon espace <ArrowRight size={18} /></button>
                <a href="#features" className="flex items-center justify-center rounded-lg border border-[#6e7a72] px-6 py-4 text-base font-semibold text-[#006547] hover:bg-[#ebf6ef]">Voir comment ça marche</a>
              </div>
            </div>
            <div className="h-[420px] overflow-hidden rounded-xl border border-[#bdc9c1] bg-white shadow-lg md:h-[600px]">
              <img src="/Commerce-facile-avec-sellam.png" alt="Aperçu du tableau de bord Sellam" className="h-full w-full object-cover object-left-top" />
            </div>
          </div>
        </section>

        <section id="features" className="border-y border-[#bdc9c1] bg-white py-6 md:py-8">
          <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-[#bdc9c1] px-5 md:grid-cols-3 md:divide-x md:divide-y-0 md:px-8 lg:px-10">
            {proofPoints.map(([Icon, title, description]) => <div key={title} className="flex items-center gap-4 p-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#ebf6ef] text-[#12805c]"><Icon size={25} /></div><div><h2 className="font-display text-lg font-semibold">{title}</h2><p className="text-sm text-[#3e4943]">{description}</p></div></div>)}
          </div>
        </section>

        <section id="roles" className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-5 md:px-8 lg:px-10"><div className="mb-12 text-center"><h2 className="font-display text-3xl font-semibold md:text-4xl">Pensé pour chaque membre de l'équipe</h2><p className="mx-auto mt-3 max-w-2xl text-base text-[#3e4943]">Une interface qui s'adapte aux besoins spécifiques de chacun, pour une fluidité opérationnelle totale.</p></div><div className="grid grid-cols-1 gap-6 md:grid-cols-3">{roles.map((role) => <article key={role.title} className="flex flex-col overflow-hidden rounded-xl border border-[#bdc9c1] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"><div className="h-48 bg-[#ebf6ef]"><img src={role.image} alt="" className="h-full w-full object-cover" /></div><div className="flex flex-1 flex-col p-6"><h3 className="font-display text-2xl font-semibold">{role.title}</h3><p className="mt-3 flex-1 text-sm leading-6 text-[#3e4943]">{role.description}</p><ul className="mt-5 space-y-3 border-t border-[#bdc9c1] pt-4">{role.items.map((item) => <li key={item} className="flex items-center gap-2 text-sm"><CheckCircle2 size={17} className="text-[#006547]" />{item}</li>)}</ul></div></article>)}</div></div>
        </section>
      </main>

      <footer className="border-t border-[#bdc9c1] bg-white py-8"><div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 text-sm text-[#6e7a72] md:flex-row md:px-8 lg:px-10"><span className="font-display text-xl font-bold text-[#006547]">Sellam</span><div className="flex gap-6"><a href="#features" className="hover:text-[#006547]">Fonctionnalités</a><a href="#roles" className="hover:text-[#006547]">Pour votre équipe</a></div><span>© {new Date().getFullYear()} Sellam. Commerce vivant.</span></div></footer>
    </div>
  );
}
