# Prompt de génération — illustration section « Services » (ChatGPT / GPT-Image)

## Où elle s'insère

`src/components/home/certification/Services.jsx` affiche pour l'instant un
emplacement `.slot` (motif hachuré, jamais un rectangle gris — voir
design-system README, « Imagerie et vidéo ») à la place de cette image. Une
fois le fichier généré et validé, il remplace ce `<Slot>` par une balise
`<img>` classique (`border border-rule-2`, `radius-flat`, pas d'ombre — même
traitement que la capture MA-Inspector dans `TechnologyTrust.jsx`).

## Scène demandée

Un inspecteur MALLOULIAUTO sur le lieu d'une inspection (pas un showroom, pas
un atelier de marque) : un véhicule utilitaire léger de service garé à
proximité, l'inspecteur accroupi près d'une roue avant d'un véhicule à
inspecter, une tablette à la main dont l'écran affiche un formulaire
d'inspection en cours de remplissage.

## Prompt à coller tel quel dans ChatGPT

> Génère une image photoréaliste au format paysage 16:9, style photographie
> commerciale automobile, lumière naturelle de journée.
>
> **Scène.** Sur un parking extérieur ou une allée résidentielle (pas un
> showroom, pas un garage de marque), un technicien d'inspection automobile
> en polo sombre uni est accroupi près de la roue avant gauche d'une berline
> grise récente, une tablette tactile à la main dont il regarde l'écran. En
> arrière-plan à quelques mètres, un véhicule utilitaire léger blanc uni
> (type fourgonnette de service) est garé, hayon ou porte latérale ouvert
> sur du matériel d'inspection rangé (mallette, appareils de mesure) —
> suggéré, pas détaillé. Lumière de fin de matinée, ambiance professionnelle
> et concrète, pas glamour.
>
> **L'écran de la tablette** doit suggérer un formulaire d'inspection avec
> des champs, des cases à cocher et une liste — mais le texte doit rester
> flou et illisible, jamais des mots ou des chiffres nets. Aucune interface
> ne doit ressembler à un produit logiciel existant.
>
> **Palette** : tons neutres et naturels (gris de la carrosserie, blanc du
> véhicule utilitaire, bitume, ciel clair). Une seule touche de couleur de
> marque autorisée : un discret liseré ou étiquette orange (#EE7749) sur la
> tablette ou une pièce d'équipement — jamais un logo texte.
>
> **Interdits absolus** : aucun texte net ni logo lisible nulle part (y
> compris sur le véhicule utilitaire, la tablette, les vêtements), aucune
> plaque d'immatriculation lisible, aucun visage identifiable tourné vers
> l'objectif, aucun élément d'interface numérique surimprimé façon capture
> d'écran, pas de style « rendu 3D » ni d'esthétique showroom éclatante —
> l'image doit se lire comme une vraie intervention sur le terrain.

## Contrôle qualité à la réception

1. **Aucun texte lisible nulle part**, y compris sur l'écran de la tablette —
   c'est le même critère que pour l'image du hero
   (`docs/prompt-hero-image.md`). Un caractère nettement lisible impose une
   régénération.
2. Aucun logo de marque automobile ou de constructeur de matériel visible.
3. La scène doit se lire comme une inspection réelle sur site, pas comme une
   photo de banque d'images générique ou un rendu showroom — c'est la règle
   du design system (« toute photo ou vidéo montre une inspection réelle »)
   qui s'applique même à un visuel généré : il doit avoir l'air d'un vrai
   geste de travail, pas d'une mise en scène publicitaire.
4. Cadrage 16:9 avec le sujet principal (inspecteur + véhicule) plutôt centré
   ou légèrement décalé — la mise en page du site plafonne l'image à
   `max-w-4xl`, elle n'a pas besoin de marge pour un texte superposé.

## Intégration

1. Enregistrer sous `public/images/home/services-field-inspection.jpg` (et
   une variante `.webp` si possible, même logique que le hero).
2. Dans `Services.jsx`, remplacer :
   ```jsx
   <Slot className="aspect-[16/9]">
     Photo — inspecteur sur site, tablette en main, rapport en cours de saisie
   </Slot>
   ```
   par :
   ```jsx
   <img
     src="/images/home/services-field-inspection.jpg"
     alt="Inspecteur MALLOULIAUTO sur site, tablette en main, saisie d'un constat"
     className="w-full h-auto border border-rule-2 aspect-[16/9] object-cover"
     loading="lazy"
   />
   ```
3. Retirer l'import de `Slot` dans `Services.jsx` s'il n'est plus utilisé
   ailleurs dans le fichier.
