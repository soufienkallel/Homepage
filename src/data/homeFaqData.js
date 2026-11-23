// Source of truth for the homepage FAQ accordion (src/components/home/certification/FAQ.jsx)
// and its FAQPage structured data (src/pages/Home.jsx). Keep both in sync by
// importing from here rather than duplicating the questions elsewhere.
//
// `home: true` = shown open on the homepage (5 questions, docs/specs/2026-10-refonte-accueil.md);
// the others sit behind « Voir toutes les questions », still on the page and in the JSON-LD.
import { PAYMENT_RULE, PRICE_GRID, TRAVEL_INCLUDED_SHORT } from './pricing';
import { TOTAL_POINTS } from './inspectionFacts';

const sold = PRICE_GRID.filter((row) => row.available);
const thermal = sold.filter((row) => row.energy === 'Thermique').map((row) => row.priceTnd);
const hybrid = sold.find((row) => row.energy === 'Hybride');

export const questions = [
  {
    home: true,
    q: 'Combien coûte le diagnostic ?',
    a: `De ${Math.min(...thermal)} à ${Math.max(...thermal)} TND TTC pour un véhicule thermique selon sa catégorie${
      hybrid ? `, ${hybrid.priceTnd} TND TTC pour un hybride` : ''
    }, avant achat ou vente. ${PAYMENT_RULE}. Le déplacement est inclus dans ${TRAVEL_INCLUDED_SHORT} ; ailleurs, des frais s'ajoutent selon la zone. Le détail est sur la page Tarifs.`,
  },
  {
    home: true,
    q: 'Dois-je être présent pendant le diagnostic ?',
    a: "Non. L'inspecteur va voir la voiture à votre place, chez le vendeur, et vous envoie le rapport par e-mail, SMS ou WhatsApp dès la fin du diagnostic. Vous pouvez aussi y assister.",
  },
  {
    home: true,
    q: "Le rapport est-il fiable si c'est le vendeur qui le commande ?",
    a: "Oui, parce que le vendeur ne peut rien y modifier. Le rapport est rédigé par l'inspecteur et remis en entier : le vendeur ne peut ni le corriger, ni en retirer un défaut. Le prix ne dépend pas de ce que le diagnostic trouve. Et l'acheteur vérifie lui-même l'authenticité du document en ligne, avec sa référence ou son QR code.",
  },
  {
    q: 'En quoi est-ce différent de la visite technique ?',
    a: "La visite technique vérifie qu'un véhicule est en état de circuler. Elle ne dit rien de son historique de réparation, de la cohérence de son kilométrage, de l'épaisseur de sa peinture ni du coût des remises en état à prévoir. Notre rapport ne la remplace pas : il documente ce qu'elle ne couvre pas.",
  },
  {
    home: true,
    q: 'Le rapport me dit-il si je dois acheter ?',
    a: "Il vous donne de quoi décider, sans décider à votre place. Chaque défaut est chiffré, et le rapport indique le prix le plus probable du véhicule dans l'état où il se trouve. La décision d'acheter vous appartient.",
  },
  {
    home: true,
    q: 'Que ne couvre pas le diagnostic ?',
    a: "Un diagnostic sans démontage ne voit pas l'usure interne d'un moteur ou d'une boîte, ni une panne intermittente qui ne se manifeste pas le jour du contrôle. Les éléments hors périmètre ou dont le véhicule n'est pas équipé sont nommés dans le rapport plutôt que passés sous silence.",
  },
  {
    q: "Est-ce la même chose qu'une expertise avant achat ?",
    a: `Oui, c'est ce que beaucoup appellent une expertise avant achat : un contrôle complet du véhicule avant de l'acheter. La différence tient à la méthode : ${TOTAL_POINTS} points contrôlés selon un protocole fixe, des mesures relevées avec des instruments, et un rapport écrit, vérifiable en ligne, plutôt qu'un avis oral.`,
  },
  {
    q: 'Que contient exactement le rapport ?',
    a: "Identification et photos du véhicule, contexte et objet du diagnostic, matériel utilisé, défauts par famille avec photo, gravité et coût estimé, tableaux de mesures (épaisseur de peinture par panneau, profondeur de sculpture par pneu, niveaux, températures), cohérence kilométrique multi-calculateurs, codes défaut, synthèse de l'inspecteur et total estimé des réparations. Sa longueur dépend du périmètre contrôlé et du nombre de défauts.",
  },
  {
    q: 'Combien de temps dure le diagnostic ?',
    a: "30 à 60 minutes sur place selon l'état du véhicule, sans démontage. La durée exacte est enregistrée et figure dans la traçabilité du rapport.",
  },
  {
    q: 'Que veut dire « vérifiable en ligne » ?',
    a: "Chaque rapport porte une référence unique et un QR code renvoyant vers une page permanente. N'importe qui — l'acheteur, un banquier, un douanier — peut confirmer que le document est authentique, à quelle date il a été émis et par quel inspecteur, sans avoir à nous contacter.",
  },
  {
    q: 'Je suis vendeur — quel est mon intérêt ?',
    a: "Un vendeur honnête n'a aujourd'hui aucun moyen de se distinguer d'un vendeur qui ne l'est pas. Un rapport indépendant, remis spontanément et vérifiable par l'acheteur, est cet argument — et il réduit la négociation à la baisse fondée sur le doute.",
  },
  {
    q: 'Je suis un garage — puis-je proposer le diagnostic ?',
    a: 'Oui. Nos centres partenaires réalisent le diagnostic dans leur atelier, avec notre protocole et nos outils, et émettent le rapport à leur nom. Les conditions se discutent au cas par cas : voir la page Devenir partenaire.',
  },
];
