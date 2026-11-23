import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'MALLOULIAUTO';
const BASE_URL = 'https://mallouliauto.com';
const DEFAULT_DESCRIPTION =
  "MALLOULIAUTO certifie l'état réel des véhicules d'occasion en Tunisie : protocole d'inspection standardisé, rapport structuré, certificat vérifiable en ligne.";
// 1200×630, nom de marque et accroche sur la photo de l'inspecteur : lisible en miniature (WhatsApp).
const DEFAULT_OG_IMAGE = `${BASE_URL}/images/og-share.jpg`;
const DEFAULT_OG_IMAGE_ALT =
  "MALLOULIAUTO : un inspecteur contrôle une voiture d'occasion avec une tablette.";

export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '',
  type = 'website',
  image = DEFAULT_OG_IMAGE,
  noIndex = false,
  jsonLd,
}) {
  const fullTitle = title
    ? `${title} | ${SITE_NAME}`
    : `${SITE_NAME} — Plateforme Automobile Intelligente`;
  const url = `${BASE_URL}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      {image === DEFAULT_OG_IMAGE && <meta property="og:image:width" content="1200" />}
      {image === DEFAULT_OG_IMAGE && <meta property="og:image:height" content="630" />}
      {image === DEFAULT_OG_IMAGE && (
        <meta property="og:image:alt" content={DEFAULT_OG_IMAGE_ALT} />
      )}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="fr_TN" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {jsonLd &&
        (Array.isArray(jsonLd) ? jsonLd : [jsonLd]).map((block, index) => (
          <script key={index} type="application/ld+json">
            {JSON.stringify(block)}
          </script>
        ))}
    </Helmet>
  );
}
