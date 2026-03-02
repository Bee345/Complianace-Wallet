/**
 * Application Constants and Configuration.
 */

export const APP_CONFIG = {
  CURRENCY: 'NGN' as const,
  SUBSCRIPTION_FEE: 500,
  OFFLINE_STORAGE_LIMIT: 10000,
};

export const LGAS = [
  { id: 'ph-city', name: 'Port Harcourt City', state: 'Rivers' },
  { id: 'obio-akpor', name: 'Obio/Akpor', state: 'Rivers' },
  { id: 'eleme', name: 'Eleme', state: 'Rivers' },
];

export const TAX_BANDS = [
  { id: 'band-1', lgaId: 'ph-city', minTurnover: 0, maxTurnover: 5000, taxAmount: 100 },
  { id: 'band-2', lgaId: 'ph-city', minTurnover: 5001, maxTurnover: 20000, taxAmount: 300 },
  { id: 'band-3', lgaId: 'ph-city', minTurnover: 20001, maxTurnover: 1000000, taxAmount: 500 },
];
