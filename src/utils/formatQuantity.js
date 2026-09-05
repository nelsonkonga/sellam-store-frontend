/**
 * Formate une quantité pour l'affichage en supprimant les zéros inutiles
 * @param {number|string} quantity - La quantité à formater
 * @returns {string} - La quantité formatée (ex: "12" au lieu de "12.00", "45.5" conservé)
 */
export function formatQuantity(quantity) {
  if (quantity === null || quantity === undefined) return '0';
  
  const num = typeof quantity === 'string' ? parseFloat(quantity) : quantity;
  
  if (isNaN(num)) return '0';
  
  // Afficher jusqu'à 2 décimales, puis supprimer les zéros inutiles
  return parseFloat(num.toFixed(2)).toString();
}

/**
 * Formate une quantité avec son unité
 * @param {number|string} quantity - La quantité à formater
 * @param {string} unitLabel - L'unité (ex: "kg", "unité", null)
 * @returns {string} - La quantité formatée avec unité (ex: "45.5 kg", "12 unités", "12")
 */
export function formatQuantityWithUnit(quantity, unitLabel) {
  const formattedQuantity = formatQuantity(quantity);
  
  if (!unitLabel || unitLabel.trim() === '') {
    return formattedQuantity;
  }
  
  // Si l'unité est "unité" ou similaire, on peut l'omettre pour plus de clarté
  const unitLower = unitLabel.toLowerCase().trim();
  if (unitLower === 'unité' || unitLower === 'unite' || unitLower === 'unit') {
    return formattedQuantity;
  }
  
  return `${formattedQuantity} ${unitLabel}`;
}
