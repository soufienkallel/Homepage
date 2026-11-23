# Liens de campagne (UTM)

Chaque demande envoyée depuis le site garde les paramètres `utm_*` de la page d'arrivée
(`src/lib/campaign.js`, conservés dans l'onglet, sans cookie) et les enregistre avec la demande.
`/admin/demandes` affiche « origine : source · medium · campagne · annonce » sur chaque ligne
(les parties absentes du lien sont omises). Un lien sans UTM reste valable :
la demande arrive simplement sans attribution.

## Conventions

Minuscules, mots séparés par des tirets, jamais d'accent ni d'espace.

| Paramètre | Rôle | Valeurs |
| --- | --- | --- |
| `utm_source` | d'où vient le visiteur | `facebook`, `instagram`, `google`, `whatsapp`, `linkedin`, `flyer`, `partenaire` |
| `utm_medium` | type de canal | `paid-social`, `social`, `cpc`, `messaging`, `print`, `referral` |
| `utm_campaign` | la campagne | `lancement-sept26` (lancement commercial, fin sept. 2026) |
| `utm_content` | facultatif : quelle annonce, quel visuel | ex. `video-inspection`, `visuel-rapport`, `flyer-a5-sfax` |

Une nouvelle campagne = un nouveau `utm_campaign` (ex. `promo-ramadan27`), jamais la réutilisation
d'un nom existant.

## Liens prêts à l'emploi — `lancement-sept26`

| Canal | Lien |
| --- | --- |
| Publicité Facebook | `https://mallouliauto.com/?utm_source=facebook&utm_medium=paid-social&utm_campaign=lancement-sept26` |
| Publicité Instagram | `https://mallouliauto.com/?utm_source=instagram&utm_medium=paid-social&utm_campaign=lancement-sept26` |
| Publication Facebook | `https://mallouliauto.com/?utm_source=facebook&utm_medium=social&utm_campaign=lancement-sept26` |
| Publication Instagram | `https://mallouliauto.com/?utm_source=instagram&utm_medium=social&utm_campaign=lancement-sept26` |
| Google Ads | `https://mallouliauto.com/?utm_source=google&utm_medium=cpc&utm_campaign=lancement-sept26` |
| WhatsApp (statut, diffusion, groupes) | `https://mallouliauto.com/demande-inspection?utm_source=whatsapp&utm_medium=messaging&utm_campaign=lancement-sept26` |
| Flyer (QR code) | `https://mallouliauto.com/flyer` → redirige vers `/demande-inspection?utm_source=flyer&utm_medium=print&utm_campaign=lancement-sept26` |
| Professionnels (LinkedIn, prospection B2B) | `https://mallouliauto.com/contact?type=partenaire&utm_source=linkedin&utm_medium=social&utm_campaign=lancement-sept26` |

Les publicités mènent à la page d'accueil, qui présente l'offre avant le formulaire. Les canaux où
le visiteur connaît déjà MALLOULIAUTO (WhatsApp, flyer) mènent directement au formulaire.

### Meta Ads : un seul lien pour toutes les annonces

URL du site : `https://mallouliauto.com/`. Champ **Paramètres d'URL** de l'annonce :

```
utm_source={{site_source_name}}&utm_medium=paid-social&utm_campaign=lancement-sept26&utm_content={{ad.name}}
```

Meta remplace `{{site_source_name}}` par la plateforme de diffusion et `{{ad.name}}` par le nom de
l'annonce : nommez les annonces selon la convention (`video-inspection`, …).

## Liens prêts à l'emploi — `roadshow-monastir-oct26`

Roadshow « Startups & PME Innovantes » (CDC / Smart Capital), Monastir, 6 oct. 2026. Public : financeurs
(fonds, SICAR, banques, structures d'appui). Flyer investisseurs A5, une page
(`Z:\MALLOULIAUTO\marketing\flyer\2026-10-roadshow-monastir\`).

| Canal | Lien |
| --- | --- |
| Flyer investisseurs (QR code) | `https://mallouliauto.com/roadshow` → redirige vers `/?utm_source=flyer&utm_medium=print&utm_campaign=roadshow-monastir-oct26&utm_content=flyer-a5-investisseurs` |

Destination : la page d'accueil (le produit, le rapport, le tarif, les partenaires), pas un formulaire — un
financeur ne remplit pas de formulaire ; le contact du fondateur est imprimé sur le flyer. La redirection
est temporaire (307) : elle pourra pointer vers une future page investisseurs sans réimprimer.
QR code : encode `https://mallouliauto.com/roadshow`, correction d'erreur « H », 33 × 33 modules.
Ne pas supprimer cette redirection tant que des flyers circulent (un lien supprimé rend le QR code
imprimé mort) : pour la faire évoluer, changer sa destination, jamais la retirer. Même règle pour `/flyer`.

## QR code des flyers

`docs/campagne/qr-flyer-lancement-sept26.svg` (vectoriel, pour l'imprimeur) et `.png` (1 640 px).
Il encode `https://mallouliauto.com/flyer`, une redirection temporaire (307) définie dans
`vercel.json` : l'adresse courte donne un QR code simple (33 × 33 modules, correction d'erreur
maximale « H ») et permet de changer la destination sans réimprimer.

- Impression : **au moins 2,5 cm de côté**, en conservant la marge blanche autour du code.
- Couleur : encre foncée sur fond clair uniquement (pas de QR orange ni inversé).
- Plusieurs versions de flyer ? Une redirection par version (`/flyer-sfax`, …) avec son
  `utm_content`, et un QR code par version.

## Vérifier avant de lancer

1. Ouvrir un des liens, envoyer une demande de test.
2. Dans `/admin/demandes`, vérifier que la ligne affiche
   « origine : facebook · paid-social · lancement-sept26 » (selon le lien utilisé).
3. Passer la demande de test en « Annulée ».
