import api from "./api";

/**
 * Récupère les informations de paiement manuel (numéro Mobile Money,
 * titulaire, lien support), affichées en repli quand le paiement CinetPay
 * échoue ou est indisponible. Endpoint public, ne nécessite pas shopId.
 * @returns {Promise<{ mobileMoneyNumber: string, mobileMoneyHolderName: string, mobileMoneyOperator: string, supportContactUrl: string }>}
 */
export async function getManualPaymentInfo() {
  const { data } = await api.get(`/payments/manual-payment-info`);
  return data;
}
