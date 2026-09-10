import { useEffect, useState, useCallback } from "react";

/**
 * Détecte qu'une nouvelle version du frontend a été déployée, via le cycle
 * de vie standard du service worker (un nouveau sw.js différent de celui
 * actif déclenche 'updatefound' puis passe à l'état 'installed').
 *
 * Volontairement NON automatique : on n'a jamais vu de déconnexion forcée ni
 * de rechargement silencieux ici. On expose juste `updateAvailable` pour
 * qu'un bandeau non bloquant propose à l'utilisateur de rafraîchir quand il
 * le souhaite -- une déconnexion/rechargement en pleine vente serait plus
 * perturbant que le petit décalage de version le temps qu'il valide.
 *
 * Le token JWT continue par ailleurs d'expirer et de forcer une reconnexion
 * selon son propre mécanisme existant (401 -> logout), totalement indépendant
 * de ce hook : une nouvelle version de l'app n'invalide pas la session.
 */
export function useAppUpdate() {
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [waitingWorker, setWaitingWorker] = useState(null);

    useEffect(() => {
        if (!("serviceWorker" in navigator)) return;

        let registrationRef = null;

        function handleUpdateFound(registration) {
            const newWorker = registration.installing;
            if (!newWorker) return;

            newWorker.addEventListener("statechange", () => {
                // 'installed' + un controller déjà actif = une mise à jour est prête
                // (si aucun controller n'existe encore, c'est juste la toute première
                // installation du service worker, pas une mise à jour à signaler).
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                    setWaitingWorker(newWorker);
                    setUpdateAvailable(true);
                }
            });
        }

        navigator.serviceWorker.getRegistration().then((registration) => {
            if (!registration) return;
            registrationRef = registration;

            // Un service worker est peut-être déjà en attente (onglet resté ouvert
            // pendant qu'un déploiement a eu lieu et que le SW a fini de s'installer).
            if (registration.waiting && navigator.serviceWorker.controller) {
                setWaitingWorker(registration.waiting);
                setUpdateAvailable(true);
            }

            registration.addEventListener("updatefound", () => handleUpdateFound(registration));

            // Vérifie activement s'il existe une mise à jour au chargement, sans
            // attendre le cycle de revalidation naturel du navigateur (qui peut
            // prendre plusieurs heures selon les headers de cache de sw.js).
            registration.update().catch(() => {});
        });

        return () => {
            // Rien à nettoyer explicitement : les listeners suivent le cycle de
            // vie de la registration, qui persiste indépendamment du composant.
        };
    }, []);

    const applyUpdate = useCallback(() => {
        if (!waitingWorker) {
            window.location.reload();
            return;
        }
        // Demande au nouveau service worker de prendre le contrôle immédiatement
        // (au lieu d'attendre la fermeture de tous les onglets), puis recharge
        // une fois le contrôle effectivement transféré.
        waitingWorker.postMessage({ type: "SKIP_WAITING" });
        navigator.serviceWorker.addEventListener(
            "controllerchange",
            () => window.location.reload(),
            { once: true }
        );
    }, [waitingWorker]);

    return { updateAvailable, applyUpdate };
}
