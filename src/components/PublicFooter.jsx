import { Link } from "react-router-dom";

/**
 * Footer unifié pour toutes les pages publiques (landing, auth, mot de passe oublié, CGU, etc.).
 * Affiche le logo Sellam, le copyright et les liens CGU / Confidentialité.
 */
export default function PublicFooter() {
  return (
    <footer className="border-t border-[#bdc9c1] bg-white py-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 text-sm text-[#6e7a72] md:flex-row md:px-8 lg:px-10">
        <span className="font-display text-xl font-bold text-[#006547]">Sellam</span>
        <div className="flex flex-wrap justify-center gap-5">
          <Link to="/terms" className="hover:text-[#006547] transition">Conditions d'utilisation</Link>
          <Link to="/privacy" className="hover:text-[#006547] transition">Politique de confidentialité</Link>
        </div>
        <span>© {new Date().getFullYear()} Sellam. Commerce vivant.</span>
      </div>
    </footer>
  );
}
