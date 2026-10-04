// Product color options. The chosen color is stored in orders.product, e.g.
// "תושבת CourtCheck · כחול", so no schema change is needed.
export const PRODUCT_NAME = 'תושבת CourtCheck';

export const COLORS = [
  { key: 'black', he: 'שחור', en: 'Black', hex: '#111111' },
  { key: 'blue', he: 'כחול', en: 'Blue', hex: '#2563EB' },
  { key: 'pink', he: 'ורוד', en: 'Pink', hex: '#EC4899' },
];

export const DEFAULT_COLOR = 'black';

export const colorByKey = (key) => COLORS.find((c) => c.key === key) || null;

// Reads the color back out of an orders.product value (null for older orders).
export const colorFromProduct = (product) =>
  COLORS.find((c) => String(product || '').endsWith(`· ${c.he}`)) || null;
