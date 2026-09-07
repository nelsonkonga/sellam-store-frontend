import api from "./api";

/**
 * Récupère le tableau de bord de parrainage de l'utilisateur connecté :
 * son code, son lien à partager, et l'état de ses récompenses.
 * @returns {Promise<{ referralCode: string, referralLink: string, totalReferred: number, totalRewarded: number, pendingRewards: Array, appliedRewards: Array }>}
 */
export async function getMyReferralSummary() {
  const { data } = await api.get(`/referrals/me`);
  return data;
}

/**
 * Liste les boutiques du parrain éligibles à recevoir une récompense en
 * attente (cas où il a plusieurs boutiques et doit choisir laquelle créditer).
 * @param {string} rewardId
 * @returns {Promise<Array<{ shopId: string, shopName: string }>>}
 */
export async function getEligibleShopsForReward(rewardId) {
  const { data } = await api.get(`/referrals/rewards/${rewardId}/eligible-shops`);
  return data;
}

/**
 * Applique une récompense en attente à la boutique choisie par le parrain.
 * @param {string} rewardId
 * @param {string} shopId
 */
export async function applyReward(rewardId, shopId) {
  const { data } = await api.post(`/referrals/rewards/${rewardId}/apply`, { shopId });
  return data;
}
