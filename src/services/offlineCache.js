/**
 * Gestion centralisée du cache offline stocké dans localStorage.
 *
 * Problème corrigé : l'intercepteur axios écrivait une entrée par requête GET
 * (offline_cache_<url>_<params>) sans jamais les nettoyer ni les limiter,
 * ce qui faisait grossir localStorage indéfiniment (chaque produit, chaque
 * page de facture, chaque boutique visitée restait en cache pour toujours).
 *
 * Cette version :
 *  - horodate chaque entrée pour appliquer un TTL (les données trop
 *    anciennes ne servent plus de repli offline, on préfère un état vide
 *    à une donnée périmée trompeuse)
 *  - impose un budget total d'octets pour le cache offline, et purge les
 *    entrées les moins récemment utilisées (LRU) quand ce budget est dépassé
 *  - expose une fonction de nettoyage explicite, utilisable au logout ou
 *    depuis un bouton "Vider le cache" dans les réglages
 */

const CACHE_PREFIX = "offline_cache_";
const META_KEY = "offline_cache_meta"; // { [key]: { size, lastAccess } }
const MAX_CACHE_BYTES = 4 * 1024 * 1024; // 4 Mio, garde de la marge sous la limite ~5-10 Mio du navigateur
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 jours : au-delà, une donnée hors ligne a plus de risques d'induire en erreur que d'aider

function readMeta() {
    try {
        const raw = localStorage.getItem(META_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function writeMeta(meta) {
    try {
        localStorage.setItem(META_KEY, JSON.stringify(meta));
    } catch {
        // Si même l'écriture des métadonnées échoue (quota déjà plein), on abandonne
        // silencieusement : le cache continuera de fonctionner en mode dégradé.
    }
}

function totalCachedBytes(meta) {
    return Object.values(meta).reduce((sum, entry) => sum + (entry.size || 0), 0);
}

/**
 * Supprime les entrées les plus anciennement consultées jusqu'à repasser
 * sous le budget, en ignorant `protectedKey` (l'entrée qu'on est en train
 * d'écrire, pour ne pas se supprimer soi-même immédiatement).
 */
function evictLeastRecentlyUsed(meta, protectedKey) {
    const entries = Object.entries(meta)
        .filter(([key]) => key !== protectedKey)
        .sort((a, b) => a[1].lastAccess - b[1].lastAccess);

    let currentTotal = totalCachedBytes(meta);
    for (const [key] of entries) {
        if (currentTotal <= MAX_CACHE_BYTES) break;
        try {
            localStorage.removeItem(key);
        } catch {
            // ignore
        }
        currentTotal -= meta[key].size || 0;
        delete meta[key];
    }
}

export function getCacheKey(url, params) {
    const paramsStr = params ? JSON.stringify(params) : "";
    return `${CACHE_PREFIX}${url}_${paramsStr}`;
}

/**
 * Écrit une réponse dans le cache offline, avec horodatage et purge du
 * cache si le budget global est dépassé.
 */
export function setCachedResponse(key, data) {
    try {
        const serialized = JSON.stringify(data);
        localStorage.setItem(key, serialized);

        const meta = readMeta();
        meta[key] = { size: serialized.length, lastAccess: Date.now() };

        if (totalCachedBytes(meta) > MAX_CACHE_BYTES) {
            evictLeastRecentlyUsed(meta, key);
        }
        writeMeta(meta);
    } catch (err) {
        // Quota dépassé malgré la purge (entrée unique trop volumineuse, etc.) :
        // on abandonne cette entrée plutôt que de faire planter la requête.
    }
}

/**
 * Lit une entrée du cache offline si elle existe et n'a pas expiré.
 * Met aussi à jour lastAccess pour que la purge LRU reflète l'usage réel.
 */
export function getCachedResponse(key) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;

        const meta = readMeta();
        const entry = meta[key];

        if (entry && Date.now() - entry.lastAccess > TTL_MS && Date.now() - (entry.createdAt || entry.lastAccess) > TTL_MS) {
            // Entrée périmée : on la retire plutôt que de renvoyer une donnée
            // potentiellement trop ancienne pour être fiable hors ligne.
            localStorage.removeItem(key);
            delete meta[key];
            writeMeta(meta);
            return null;
        }

        if (entry) {
            entry.lastAccess = Date.now();
            writeMeta(meta);
        }

        return JSON.parse(raw);
    } catch {
        return null;
    }
}

/**
 * Purge complète du cache offline -- utilisée au logout pour ne pas laisser
 * les données d'un compte accessibles hors ligne à la session suivante, et
 * disponible comme action manuelle ("Vider le cache") dans les réglages.
 */
export function clearOfflineCache() {
    const meta = readMeta();
    for (const key of Object.keys(meta)) {
        try {
            localStorage.removeItem(key);
        } catch {
            // ignore
        }
    }
    try {
        localStorage.removeItem(META_KEY);
    } catch {
        // ignore
    }
}

/**
 * Retourne la taille actuelle du cache offline en octets, pour affichage
 * dans les réglages ("Cache : 1.2 Mo utilisés").
 */
export function getOfflineCacheSize() {
    return totalCachedBytes(readMeta());
}
