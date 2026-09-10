import { RefreshCw } from "lucide-react";
import { useAppUpdate } from "../hooks/useAppUpdate";

/**
 * Bandeau discret affiché en haut de l'app quand une nouvelle version du
 * frontend a été déployée. Volontairement non bloquant et sans rechargement
 * automatique : l'utilisateur choisit quand appliquer la mise à jour, pour
 * ne jamais interrompre une vente ou une saisie en cours.
 */
export default function UpdateBanner() {
    const { updateAvailable, applyUpdate } = useAppUpdate();

    if (!updateAvailable) return null;

    return (
        <div className="fixed inset-x-0 top-0 z-[100] flex items-center justify-center gap-3 bg-[#141e1a] px-4 py-2.5 text-sm text-white shadow-md">
            <span>Une nouvelle version de l'application est disponible.</span>
            <button
                type="button"
                onClick={applyUpdate}
                className="flex items-center gap-1.5 rounded-md bg-[#12805c] px-3 py-1 font-semibold hover:bg-[#0f6b4c]"
            >
                <RefreshCw size={14} /> Mettre à jour
            </button>
        </div>
    );
}
