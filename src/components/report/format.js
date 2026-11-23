import { SAMPLE_PHOTO_DIR } from '../../data/sampleReport';

/** Helpers shared by the sample report page and the homepage preview of its first page. */
export const PHOTO_URL = (file) => `${SAMPLE_PHOTO_DIR}/${file}.webp`;
export const tnd = (amount) => `${amount} TND`;
/** 114500 → « 114 500 » (espace fine insécable, comme le rapport du produit). */
export const frNumber = (n) => n.toLocaleString('fr-FR', { maximumFractionDigits: 0 });
export const plural = (count) => `${count} constat${count > 1 ? 's' : ''}`;
