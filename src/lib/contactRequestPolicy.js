/**
 * Rules for inspection and contact requests — shared by the browser forms and
 * api/contact-requests.js, so the two can never disagree. Plain module, no browser
 * or Node dependency.
 */
import { OBJETS_INSPECTION } from '../data/inspectionFacts.js';

export const REQUEST_KINDS = ['inspection', 'professionnel', 'partenaire', 'autre'];

/** The report's own inspection purposes (inspectionFacts.js). */
export const PURPOSES = OBJETS_INSPECTION.map((objet) => objet.label);

export const LOCATION_TYPES = [
  { value: 'vendeur', label: 'Chez le vendeur' },
  { value: 'domicile', label: 'Chez moi' },
  { value: 'locaux', label: 'Dans vos locaux' },
];

export const CHANNELS = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'appel', label: 'Appel' },
];

export const PREFERRED_DATES = [
  'Dès que possible',
  'Cette semaine',
  'La semaine prochaine',
  'Une date précise (à convenir)',
];

const currentYear = new Date().getFullYear();
export const VEHICLE_YEARS = [
  'Je ne sais pas',
  ...Array.from({ length: 12 }, (_, i) => String(currentYear - i)),
  `Avant ${currentYear - 11}`,
];

export const STATUSES = [
  { value: 'nouvelle', label: 'Nouvelle' },
  { value: 'contactee', label: 'Contactée' },
  { value: 'planifiee', label: 'Planifiée' },
  { value: 'realisee', label: 'Réalisée' },
  { value: 'sans_suite', label: 'Sans suite' },
  { value: 'annulee', label: 'Annulée' },
];

const LIMITS = {
  fullName: 200,
  phone: 40,
  email: 320,
  company: 200,
  message: 4000,
  vehicleMake: 80,
  vehicleModel: 80,
  city: 120,
  listingUrl: 2048,
};

const clean = (value, max) => {
  const text = typeof value === 'string' ? value.trim() : '';
  return text ? text.slice(0, max) : '';
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** A phone number with 8 to 15 digits, allowing spaces, dots, dashes, brackets and a leading +. */
export const isValidPhone = (value) => {
  const text = String(value || '').trim();
  if (!/^\+?[\d\s.\-()]+$/.test(text)) return false;
  const digits = text.replace(/\D/g, '');
  return digits.length >= 8 && digits.length <= 15;
};

const isHttpUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
};

/**
 * Normalises and validates a request. Returns `{ data, errors }`: `errors` maps a
 * field name to a French message, `data` holds the cleaned values (column names).
 */
export function validateContactRequest(input) {
  const src = input && typeof input === 'object' ? input : {};
  const errors = {};
  const kind = REQUEST_KINDS.includes(src.kind) ? src.kind : null;
  if (!kind) errors.kind = 'Type de demande inconnu.';

  const data = {
    kind,
    full_name: clean(src.fullName, LIMITS.fullName),
    phone: clean(src.phone, LIMITS.phone),
    email: clean(src.email, LIMITS.email).toLowerCase() || null,
    company: clean(src.company, LIMITS.company) || null,
    message: clean(src.message, LIMITS.message) || null,
    preferred_channel: CHANNELS.some((c) => c.value === src.preferredChannel)
      ? src.preferredChannel
      : 'appel',
  };

  if (data.full_name.length < 2) errors.fullName = 'Indiquez votre nom.';
  if (!isValidPhone(data.phone)) errors.phone = 'Indiquez un numéro de téléphone valide.';
  if (data.email && !EMAIL_PATTERN.test(data.email)) errors.email = 'Adresse e-mail invalide.';
  if (src.privacyAccepted !== true) {
    errors.privacyAccepted = "L'acceptation de la politique de confidentialité est requise.";
  }

  if (kind === 'inspection') {
    Object.assign(data, {
      vehicle_make: clean(src.vehicleMake, LIMITS.vehicleMake),
      vehicle_model: clean(src.vehicleModel, LIMITS.vehicleModel),
      vehicle_year: VEHICLE_YEARS.includes(src.vehicleYear) ? src.vehicleYear : null,
      listing_url: clean(src.listingUrl, LIMITS.listingUrl) || null,
      purpose: PURPOSES.includes(src.purpose) ? src.purpose : null,
      location_type: LOCATION_TYPES.some((l) => l.value === src.locationType)
        ? src.locationType
        : null,
      city: clean(src.city, LIMITS.city),
      preferred_date: PREFERRED_DATES.includes(src.preferredDate) ? src.preferredDate : null,
    });
    if (!data.vehicle_make) errors.vehicleMake = 'Indiquez la marque.';
    if (!data.vehicle_model) errors.vehicleModel = 'Indiquez le modèle.';
    if (data.listing_url && !isHttpUrl(data.listing_url)) {
      errors.listingUrl = "Le lien de l'annonce doit commencer par https://.";
    }
    if (!data.purpose) errors.purpose = "Choisissez l'objet de l'inspection.";
    if (!data.location_type) errors.locationType = 'Choisissez le lieu.';
    if (!data.city) errors.city = 'Indiquez la ville.';
  } else if (kind) {
    if (!data.message) errors.message = 'Écrivez votre message.';
  }

  return { data, errors };
}
