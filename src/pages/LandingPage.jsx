import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  Store,
  Package,
  Wallet,
  Smartphone,
  ShieldCheck,
  ChevronRight,
  Star,
  ArrowRight,
  Menu,
  X,
  Zap,
  TrendingUp,
  Users,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Data
   ───────────────────────────────────────────── */

const FEATURES = [
  {
    icon: BarChart3,
    title: "Tableau de bord intelligent",
    description:
      "Suivez vos ventes, marges et alertes de stock en temps réel avec un tableau de bord pensé pour la prise de décision rapide.",
  },
  {
    icon: Store,
    title: "Multi-boutiques",
    description:
      "Gérez autant de points de vente que nécessaire depuis un seul compte. Passez d'une boutique à l'autre en un clic.",
  },
  {
    icon: Package,
    title: "Gestion de stock avancée",
    description:
      "Catalogue produits avec images, prix d'achat, prix de vente, alertes de seuil et suivi des quantités.",
  },
  {
    icon: Wallet,
    title: "Bilan quotidien automatisé",
    description:
      "Recettes, dépenses, solde de caisse — tout est calculé automatiquement chaque jour. Fini les erreurs de calcul.",
  },
  {
    icon: Smartphone,
    title: "Mobile First",
    description:
      "Conçu pour être utilisé sur le terrain. Interface optimisée pour smartphone, clavier numérique intégré.",
  },
  {
    icon: ShieldCheck,
    title: "Sécurisé & Fiable",
    description:
      "Authentification robuste, données protégées et accès limité à vos boutiques. Vos données restent vos données.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Créez votre compte",
    description: "Inscription rapide en 30 secondes. Aucune carte bancaire requise.",
  },
  {
    step: "02",
    title: "Ajoutez vos boutiques",
    description: "Configurez vos points de vente, ajoutez vos produits et définissez vos prix.",
  },
  {
    step: "03",
    title: "Gérez & Prospérez",
    description: "Enregistrez vos ventes, suivez vos marges et consultez vos bilans quotidiens.",
  },
];

const TESTIMONIALS = [
  {
    name: "Amina Traoré",
    role: "Gérante, Boutique Mode Abidjan",
    text: "Depuis que j'utilise Sellam, je ne perds plus de temps à calculer mes marges à la main. Tout est automatique et je sais exactement où j'en suis chaque soir.",
    stars: 5,
  },
  {
    name: "Moussa Diallo",
    role: "Commerçant, 3 boutiques Dakar",
    text: "Gérer 3 boutiques c'était un cauchemar avant Sellam. Maintenant je passe d'une boutique à l'autre en un clic et mes bilans sont toujours à jour.",
    stars: 5,
  },
  {
    name: "Fatou Bamba",
    role: "Vendeuse, Marché Adjamé",
    text: "L'application est super simple ! Même sans être une experte en technologie, j'ai compris comment l'utiliser en 5 minutes. Un vrai gain de temps.",
    stars: 5,
  },
];

const STATS = [
  { value: 2000, suffix: "+", label: "Gérants actifs", icon: Users },
  { value: 500, suffix: "K+", label: "Ventes suivies", icon: TrendingUp },
  { value: 98, suffix: "%", label: "Satisfaction", icon: Zap },
];

/* ─────────────────────────────────────────────
   Custom hook — Intersection Observer
   ───────────────────────────────────────────── */

function useRevealOnScroll() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    // Observe the container and all children with .reveal
    const revealElements = el.querySelectorAll(".reveal");
    revealElements.forEach((child) => observer.observe(child));

    return () => observer.disconnect();
  }, []);

  return ref;
}

/* ─────────────────────────────────────────────
   Animated counter hook
   ───────────────────────────────────────────── */

function useCountUp(target, duration = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;

    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [started, target, duration]);

  return { count, ref };
}

/* ─────────────────────────────────────────────
   Sub-components
   ───────────────────────────────────────────── */

function Navbar({ onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-nav shadow-lg shadow-black/10" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        {/* Logo */}
        <a href="#hero" className="flex items-center gap-2.5 group">
          <img src="/sellam-logo.png" alt="Sellam" className="h-32 w-auto object-contain" />
        </a>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm text-gray-400 transition hover:text-white">
            Fonctionnalités
          </a>
          <a href="#how-it-works" className="text-sm text-gray-400 transition hover:text-white">
            Comment ça marche
          </a>
          <a href="#testimonials" className="text-sm text-gray-400 transition hover:text-white">
            Témoignages
          </a>
        </div>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={() => onNavigate("/login")}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-300 transition hover:text-white"
          >
            Connexion
          </button>
          <button
            onClick={() => onNavigate("/register")}
            className="btn-gradient rounded-lg px-5 py-2.5 text-sm font-semibold text-white"
          >
            Commencer gratuitement
          </button>
        </div>

        {/* Mobile burger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-300 md:hidden"
          aria-label="Menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="glass-nav border-t border-white/5 px-5 pb-6 pt-4 md:hidden">
          <div className="flex flex-col gap-4">
            <a
              href="#features"
              onClick={() => setIsOpen(false)}
              className="text-sm text-gray-300 transition hover:text-white"
            >
              Fonctionnalités
            </a>
            <a
              href="#how-it-works"
              onClick={() => setIsOpen(false)}
              className="text-sm text-gray-300 transition hover:text-white"
            >
              Comment ça marche
            </a>
            <a
              href="#testimonials"
              onClick={() => setIsOpen(false)}
              className="text-sm text-gray-300 transition hover:text-white"
            >
              Témoignages
            </a>
            <hr className="border-white/10" />
            <button
              onClick={() => { setIsOpen(false); onNavigate("/login"); }}
              className="text-sm font-medium text-gray-300 text-left"
            >
              Connexion
            </button>
            <button
              onClick={() => { setIsOpen(false); onNavigate("/register"); }}
              className="btn-gradient rounded-lg px-5 py-2.5 text-sm font-semibold text-white text-center"
            >
              Commencer gratuitement
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

function HeroSection({ onNavigate }) {
  return (
    <section
      id="hero"
      className="relative min-h-screen bg-hero-gradient bg-grid-pattern overflow-hidden flex items-center"
    >
      {/* Decorative orbs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-brand-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-[400px] w-[400px] rounded-full bg-blue-600/15 blur-[100px]" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-brand-500/5 blur-[80px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-5 pt-28 pb-16 lg:px-8 lg:pt-32 lg:pb-24">
        <div className="flex flex-col items-center lg:flex-row lg:items-center lg:gap-16">
          {/* Left — Text */}
          <div className="flex-1 text-center lg:text-left">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 animate-fade-in-down">
              <Zap size={14} className="text-brand-400" />
              <span className="text-xs font-semibold text-brand-300">
                Nouveau — Bilan quotidien automatisé
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl animate-fade-in-up">
              Gérez vos boutiques{" "}
              <span className="text-gradient">en un clic</span>
            </h1>

            {/* Subheadline */}
            <p className="mt-5 max-w-xl text-base text-gray-400 sm:text-lg lg:text-xl animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
              L'outil tout-en-un pour suivre vos ventes, gérer vos stocks et
              maîtriser vos bilans quotidiens.{" "}
              <span className="text-gray-300">Simple, rapide et professionnel.</span>
            </p>

            {/* CTA Buttons — visible dès le premier coup d'œil */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              <button
                onClick={() => onNavigate("/register")}
                className="btn-gradient inline-flex items-center justify-center gap-2 rounded-xl px-7 py-4 text-base font-semibold text-white shadow-xl shadow-brand-500/25"
              >
                Commencer gratuitement
                <ArrowRight size={18} />
              </button>
              <button
                onClick={() => {
                  document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="btn-outline inline-flex items-center justify-center gap-2 rounded-xl px-7 py-4 text-base font-semibold"
              >
                Découvrir les fonctionnalités
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Social proof */}
            <div className="mt-8 flex items-center justify-center gap-4 lg:justify-start animate-fade-in-up" style={{ animationDelay: "0.45s" }}>
              <div className="flex -space-x-2">
                {[
                  "bg-gradient-to-br from-pink-400 to-rose-500",
                  "bg-gradient-to-br from-blue-400 to-cyan-500",
                  "bg-gradient-to-br from-emerald-400 to-teal-500",
                  "bg-gradient-to-br from-amber-400 to-orange-500",
                ].map((gradient, i) => (
                  <div
                    key={i}
                    className={`h-8 w-8 rounded-full ${gradient} border-2 border-[#0a0518] flex items-center justify-center text-[10px] font-bold text-white`}
                  >
                    {["AT", "MD", "FB", "SK"][i]}
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
                  ))}
                  <span className="ml-1 text-gray-400">4.9/5</span>
                </div>
                <p className="text-gray-500 text-xs">
                  +2 000 gérants satisfaits
                </p>
              </div>
            </div>
          </div>

          {/* Right — Dashboard Preview */}
          <div className="mt-12 flex-1 lg:mt-0 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <div className="relative">
              {/* Glow behind image */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-500/30 to-blue-500/20 blur-3xl scale-95 animate-pulse-slow" />
              {/* Image */}
              <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-brand-900/40 animate-float">
                <img
                  src="/dashboard-preview.jpg"
                  alt="Aperçu du tableau de bord Sellam"
                  className="w-full h-auto"
                  loading="eager"
                />
                {/* Overlay gradient bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0518] via-transparent to-transparent opacity-40" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
        <span className="text-xs text-gray-500">Défiler vers le bas</span>
        <div className="h-8 w-5 rounded-full border border-gray-600 flex items-start justify-center p-1">
          <div className="h-2 w-1 rounded-full bg-brand-400 animate-bounce" />
        </div>
      </div>
    </section>
  );
}

function StatCard({ value, suffix, label, icon: Icon }) {
  const { count, ref } = useCountUp(value, 2000);
  return (
    <div ref={ref} className="flex flex-col items-center gap-2 px-6 py-4">
      <Icon size={22} className="text-brand-400 mb-1" />
      <div className="text-3xl font-extrabold text-white sm:text-4xl">
        {count.toLocaleString("fr-FR")}
        <span className="text-brand-400">{suffix}</span>
      </div>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  );
}

function StatsSection() {
  const sectionRef = useRevealOnScroll();
  return (
    <section ref={sectionRef} className="bg-section-dark relative border-y border-white/5">
      <div className="mx-auto max-w-5xl px-5 py-16 lg:px-8">
        <div className="reveal flex flex-col items-center gap-8 sm:flex-row sm:justify-around">
          {STATS.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon: Icon, title, description, delay }) {
  return (
    <div
      className={`reveal reveal-delay-${delay} glass group rounded-2xl p-6 transition-all duration-300 hover:bg-white/[0.08] hover:border-brand-500/30 hover:shadow-lg hover:shadow-brand-500/5`}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500/20 to-blue-500/20 border border-brand-500/20 group-hover:from-brand-500/30 group-hover:to-blue-500/30 transition-colors">
        <Icon size={22} className="text-brand-400" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
      <p className="text-sm leading-relaxed text-gray-400">{description}</p>
    </div>
  );
}

function FeaturesSection() {
  const sectionRef = useRevealOnScroll();
  return (
    <section
      id="features"
      ref={sectionRef}
      className="bg-section-alt relative overflow-hidden"
    >
      {/* Decorative orb */}
      <div className="pointer-events-none absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-blue-500/5 blur-[100px]" />

      <div className="relative mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
        {/* Section header */}
        <div className="reveal mb-14 text-center">
          <span className="inline-block rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1 text-xs font-semibold text-brand-300 mb-4">
            Fonctionnalités
          </span>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Tout ce dont vous avez besoin,{" "}
            <span className="text-gradient">rien de superflu</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-gray-400">
            Des outils puissants et intuitifs pour gérer votre commerce au quotidien,
            où que vous soyez.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.title} {...feature} delay={i % 5 + 1} />
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const sectionRef = useRevealOnScroll();
  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="bg-section-dark relative overflow-hidden"
    >
      <div className="pointer-events-none absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-brand-600/8 blur-[80px]" />

      <div className="relative mx-auto max-w-5xl px-5 py-20 lg:px-8 lg:py-28">
        {/* Header */}
        <div className="reveal mb-14 text-center">
          <span className="inline-block rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1 text-xs font-semibold text-blue-300 mb-4">
            Comment ça marche
          </span>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Opérationnel en{" "}
            <span className="text-gradient">3 étapes</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-gray-400">
            Commencez à gérer vos boutiques en quelques minutes, sans formation.
          </p>
        </div>

        {/* Steps */}
        <div className="relative flex flex-col gap-8 lg:flex-row lg:gap-6">
          {/* Connection line (desktop) */}
          <div className="pointer-events-none absolute top-14 left-[16.66%] right-[16.66%] hidden h-px bg-gradient-to-r from-brand-500/40 via-blue-500/40 to-brand-500/40 lg:block" />

          {STEPS.map((item, i) => (
            <div
              key={item.step}
              className={`reveal reveal-delay-${i + 1} flex-1 text-center`}
            >
              <div className="relative mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-blue-500 text-xl font-bold text-white shadow-lg shadow-brand-500/25">
                {item.step}
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">
                {item.title}
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ name, role, text, stars }) {
  return (
    <div className="glass rounded-2xl p-6 flex flex-col min-w-[280px] sm:min-w-[340px]">
      {/* Stars */}
      <div className="mb-4 flex gap-1">
        {Array.from({ length: stars }).map((_, i) => (
          <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
        ))}
      </div>
      {/* Quote */}
      <p className="flex-1 text-sm leading-relaxed text-gray-300 mb-5">
        "{text}"
      </p>
      {/* Author */}
      <div className="flex items-center gap-3 border-t border-white/5 pt-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-blue-500 text-sm font-bold text-white">
          {name.split(" ").map(n => n[0]).join("")}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{name}</p>
          <p className="text-xs text-gray-500">{role}</p>
        </div>
      </div>
    </div>
  );
}

function TestimonialsSection() {
  const sectionRef = useRevealOnScroll();
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="testimonials"
      ref={sectionRef}
      className="bg-section-alt relative overflow-hidden"
    >
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-brand-500/5 blur-[100px]" />

      <div className="relative mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
        {/* Header */}
        <div className="reveal mb-14 text-center">
          <span className="inline-block rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1 text-xs font-semibold text-emerald-300 mb-4">
            Témoignages
          </span>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Ils nous font{" "}
            <span className="text-gradient">confiance</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-gray-400">
            Découvrez comment Sellam transforme le quotidien de nos utilisateurs.
          </p>
        </div>

        {/* Testimonials — desktop grid / mobile carousel */}
        <div className="reveal hidden gap-5 sm:grid sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <TestimonialCard key={t.name} {...t} />
          ))}
        </div>

        {/* Mobile carousel */}
        <div className="reveal sm:hidden">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {TESTIMONIALS.map((t) => (
                <div key={t.name} className="w-full flex-shrink-0 px-1">
                  <TestimonialCard {...t} />
                </div>
              ))}
            </div>
          </div>
          {/* Dots */}
          <div className="mt-6 flex justify-center gap-2">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                aria-label={`Témoignage ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === activeIndex
                    ? "w-6 bg-brand-500"
                    : "w-2 bg-gray-600 hover:bg-gray-500"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection({ onNavigate }) {
  const sectionRef = useRevealOnScroll();
  return (
    <section ref={sectionRef} className="relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-brand-800 to-blue-900" />
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-30" />
      <div className="pointer-events-none absolute -top-20 -right-20 h-[400px] w-[400px] rounded-full bg-brand-500/20 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-[300px] w-[300px] rounded-full bg-blue-500/15 blur-[80px]" />

      <div className="relative mx-auto max-w-4xl px-5 py-20 text-center lg:px-8 lg:py-28">
        <div className="reveal">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
            Prêt à transformer la gestion
            <br />
            <span className="text-brand-200">de vos boutiques ?</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base text-brand-200/70 sm:text-lg">
            Rejoignez des milliers de gérants qui font confiance à Sellam pour
            simplifier leur quotidien.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <button
              onClick={() => onNavigate("/register")}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-brand-900 shadow-xl transition hover:bg-gray-100 hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0"
            >
              Commencer gratuitement
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => onNavigate("/login")}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10"
            >
              J'ai déjà un compte
            </button>
          </div>
          <p className="mt-5 text-sm text-brand-200/50">
            Gratuit pour toujours • Aucune carte bancaire requise
          </p>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0a0518]">
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <div className="flex flex-col items-center gap-8 sm:flex-row sm:justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <img src="/sellam-logo.png" alt="Sellam" className="h-32  w-auto object-contain" />
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <a href="#features" className="transition hover:text-gray-300">
              Fonctionnalités
            </a>
            <a href="#how-it-works" className="transition hover:text-gray-300">
              Comment ça marche
            </a>
            <a href="#testimonials" className="transition hover:text-gray-300">
              Témoignages
            </a>
          </div>

          {/* Copyright */}
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} Sellam. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────
   Main LandingPage component
   ───────────────────────────────────────────── */

export default function LandingPage() {
  const navigate = useNavigate();

  const handleNavigate = useCallback(
    (path) => navigate(path),
    [navigate]
  );

  return (
    <div className="min-h-screen bg-[#0a0518] text-white">
      <Navbar onNavigate={handleNavigate} />
      <HeroSection onNavigate={handleNavigate} />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CTASection onNavigate={handleNavigate} />
      <Footer />
    </div>
  );
}
