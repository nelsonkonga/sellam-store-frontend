import api from "./api";

/**
 * Récupère l'état actuel de l'abonnement d'une boutique : statut, jours
 * restants, message d'avertissement éventuel. Le backend recalcule le
 * statut à chaque appel (getOrRecalculate), donc cette donnée est toujours
 * à jour sans avoir besoin de rafraîchir manuellement.
 * @param {string} shopId
 * @returns {Promise<{ shopId: string, plan: string, status: string, trialEndsAt: string|null, currentPeriodEndsAt: string|null, graceUntil: string|null, bonusDaysEarned: number, daysRemaining: number, accessBlocked: boolean, warningMessage: string|null }>}
 */
export async function getSubscription(shopId) {
  const { data } = await api.get(`/shops/${shopId}/subscription`);
  return data;
}

/**
 * Initie un paiement CinetPay pour renouveler/activer l'abonnement.
 * Reste accessible même si la boutique est bloquée (EXPIRED) — c'est la
 * seule route d'écriture exemptée par SubscriptionAccessFilter.
 * @param {string} shopId
 * @returns {Promise<{ transactionId: string, paymentToken: string, amount: number, currency: string, siteId: string }>}
 */
export async function initiateSubscriptionPayment(shopId) {
  const { data } = await api.post(`/shops/${shopId}/subscription/payment/initiate`);
  return data;
}
