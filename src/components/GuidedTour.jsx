import { useEffect, useState } from "react";

const STEPS = [
  { selector: "[data-tour='shop']", title: "Votre boutique", body: "Vous travaillez ici. Le nom affiché est celui de la boutique ouverte." },
  { selector: "[data-tour='products']", title: "Ajoutez un produit", body: "Enregistrez ce que vous vendez, avec son prix et son stock." },
  { selector: "[data-tour='sale']", title: "Enregistrez une vente", body: "Choisissez les produits, la quantité, puis validez la facture." },
  { selector: "[data-tour='invoices']", title: "Retrouvez la facture", body: "L'historique liste les ventes validées et celles encore en attente." },
  { selector: "[data-tour='team']", title: "Invitez un caissier", body: "Depuis l'équipe, le gérant crée un accès et choisit ce que la personne peut voir, y compris les rapports." },
];

export default function GuidedTour() {
  const [index, setIndex] = useState(0);
  const [box, setBox] = useState(null);
  const [open, setOpen] = useState(() => localStorage.getItem("sellam-tour-done") !== "1");

  const step = STEPS[index];

  useEffect(() => {
    if (!open) return undefined;
    const node = document.querySelector(step.selector);
    if (!node) {
      if (index >= STEPS.length - 1) {
        localStorage.setItem("sellam-tour-done", "1");
        setOpen(false);
      } else {
        setIndex((value) => value + 1);
      }
      return undefined;
    }
    const rect = node.getBoundingClientRect();
    setBox({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
    node.scrollIntoView({ block: "nearest" });
    return undefined;
  }, [open, step]);

  if (!open) return null;

  function finish() {
    localStorage.setItem("sellam-tour-done", "1");
    setOpen(false);
  }

  function next() {
    if (index >= STEPS.length - 1) {
      finish();
      return;
    }
    setIndex((value) => value + 1);
  }

  return (
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-black/50" />
      {box && (
        <div
          className="absolute rounded-xl ring-4 ring-white"
          style={{ top: box.top - 6, left: box.left - 6, width: box.width + 12, height: box.height + 12 }}
        />
      )}
      <div className="absolute bottom-6 left-1/2 w-[min(420px,calc(100%-2rem))] -translate-x-1/2 rounded-xl bg-white p-5 text-[#141e1a] shadow-xl">
        <p className="text-xs font-bold uppercase tracking-wide text-[#006547]">Étape {index + 1} sur {STEPS.length}</p>
        <h2 className="mt-1 text-lg font-semibold">{step.title}</h2>
        <p className="mt-2 text-sm text-[#3e4943]">{step.body}</p>
        <div className="mt-4 flex justify-between gap-3">
          <button type="button" onClick={finish} className="text-sm font-semibold text-[#3e4943]">Passer</button>
          <button type="button" onClick={next} className="rounded-lg bg-[#006547] px-4 py-2 text-sm font-semibold text-white">
            {index >= STEPS.length - 1 ? "Terminer" : "Suivant"}
          </button>
        </div>
      </div>
    </div>
  );
}
