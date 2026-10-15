// Price for a quantity — shared by the checkout page and the server
// (api/create-payment.js), so what the buyer sees is exactly what is charged.
//   1 unit  → unit price (₪89)
//   2 units → "2 ב-₪149" (the same ratio scales if the unit price changes)
//   3+      → whichever is cheaper: the 2-for-149 rate per unit, or the volume
//             discount 2×qty+1 % (… 9→19%, 10→21%)
export const MAX_QTY = 10;
const PAIR_RATIO = 149 / 178; // ₪149 for two ₪89 units

export function quote(unitPrice, qty) {
  const q = Math.min(MAX_QTY, Math.max(1, Math.floor(Number(qty)) || 1));
  const full = unitPrice * q;
  if (q < 2) return { qty: q, full, total: Math.round(full), savings: 0 };
  const byVolume = Math.round(full * (1 - (2 * q + 1) / 100));
  const byPair = Math.round(full * PAIR_RATIO);
  const total = Math.min(byVolume, byPair);
  return { qty: q, full, total, savings: Math.round(full - total) };
}
