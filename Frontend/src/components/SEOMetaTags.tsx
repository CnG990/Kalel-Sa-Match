import { Helmet } from 'react-helmet-async';

interface SEOMetaTagsProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  noIndex?: boolean;
  sameAs?: string[];
}

const SEOMetaTags: React.FC<SEOMetaTagsProps> = ({
  title,
  description,
  image = 'https://kalelsamatch.com/logo.png',
  url = 'https://kalelsamatch.com',
  type = 'website',
  noIndex = false,
  sameAs = [
    'https://www.facebook.com/kalelsamatch',
    'https://www.instagram.com/kalelsamatch',
    'https://www.youtube.com/@kalelsamatch'
  ]
}) => {
  const siteTitle = 'Kalél Sa Match';
  const fullTitle = title ? `${title} - ${siteTitle}` : siteTitle;
  
  const defaultDescription = 'Réservez des terrains synthétiques partout au Sénégal en 30s. Paiement Wave/Orange Money, confirmation instantanée, carte interactive. 🏟️⚽';
  const finalDescription = description || defaultDescription;

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteTitle,
    url,
    logo: image,
    sameAs,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+221000000000',
      contactType: 'customer service',
      areaServed: 'SN',
      availableLanguage: ['fr']
    }
  };

  return (
    <Helmet>
      {/* Basic meta */}
      <title>{fullTitle}</title>
      <meta name="description" content={finalDescription} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph / Facebook / WhatsApp */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:image:alt" content={`${fullTitle} - ${finalDescription}`} />
      <meta property="og:locale" content="fr_SN" />
      <meta property="og:site_name" content={siteTitle} />
      
      {/* WhatsApp optimisation */}
      <meta property="og:restrictions:country:allowed" content="SN" />
      <meta property="og:restrictions:age" content="13+" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={finalDescription} />
      <meta property="twitter:image" content={image} />
      <meta property="twitter:image:alt" content={`${fullTitle} - ${finalDescription}`} />

      {/* Additional meta */}
      <meta name="subject" content="Réservation de terrains de football au Sénégal" />
      <meta name="copyright" content="Kalél Sa Match © 2024" />
      <meta name="abstract" content={finalDescription} />
      <meta name="category" content="sports, football, reservation, sénégal" />
      <meta name="coverage" content="Worldwide" />
      <meta name="distribution" content="Global" />
      <meta name="rating" content="General" />

      {/* Canonical URL */}
      <link rel="canonical" href={url} />

      {/* JSON-LD Organization */}
      <script type="application/ld+json">{JSON.stringify(organizationJsonLd)}</script>
    </Helmet>
  );
};

export default SEOMetaTags;
