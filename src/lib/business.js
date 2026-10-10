// Single source of truth for the business details shown in the terms, privacy
// policy, cancellation page and accessibility statement.
//
// ⚠️ Israeli consumer law (distance sales, חוק הגנת הצרכן §14ג) requires the
// seller's identity, ID / company number, address and contact details to be
// disclosed to buyers. Fill in every empty field before taking real orders —
// empty fields are simply hidden on the site.
export const BUSINESS = {
  brand: 'NETCAM',
  legalName: '', // e.g. 'ישראל ישראלי' or 'נטקאם בע"מ'
  businessType: '', // 'עוסק פטור' | 'עוסק מורשה' | 'חברה בע"מ'
  businessId: '', // ח.פ. / ע.מ. / ת.ז.
  address: '', // full postal address for written notices
  phone: '', // e.g. '050-0000000'
  email: 'yuvalsamai@gmail.com',
  // Accessibility coordinator (רכז/ת נגישות)
  a11yContactName: '',
  // true if prices include VAT (עוסק מורשה / חברה); false for עוסק פטור; null = don't state.
  vatIncluded: null,
  // Date the legal texts were last reviewed (shown on the pages).
  updated: 'אוקטובר 2026',
};

export const INSTAGRAM_HANDLE = '@netcam_il';
export const INSTAGRAM_URL = 'https://www.instagram.com/netcam_il/';
