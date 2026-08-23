export function recalculateCart(lines, globalDiscountType, globalDiscountValue) {
  let subtotal = 0;
  
  const updatedLines = lines.map(line => {
    const price = Number(line.product.sellingPrice) || 0;
    const qty = Number(line.quantity) || 0;
    const lineSub = price * qty;
    
    let lineDisc = 0;
    if (line.lineDiscountType === 'PERCENTAGE' && line.lineDiscountValue) {
      lineDisc = lineSub * (line.lineDiscountValue / 100);
    } else if (line.lineDiscountType === 'FIXED_AMOUNT' && line.lineDiscountValue) {
      lineDisc = line.lineDiscountValue;
    }
    
    const lineTotal = lineSub - lineDisc;
    subtotal += lineTotal;
    
    return {
      ...line,
      lineSubtotal: lineSub,
      discountAmount: lineDisc,
      totalPrice: lineTotal
    };
  });
  
  let globalDisc = 0;
  if (globalDiscountType === 'PERCENTAGE' && globalDiscountValue) {
    globalDisc = subtotal * (globalDiscountValue / 100);
  } else if (globalDiscountType === 'FIXED_AMOUNT' && globalDiscountValue) {
    globalDisc = globalDiscountValue;
  }
  
  const totalAmount = subtotal - globalDisc;
  
  return {
    lines: updatedLines,
    subtotal,
    discountAmount: globalDisc,
    totalAmount
  };
}
