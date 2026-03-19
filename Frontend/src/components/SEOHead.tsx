import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  noindex?: boolean;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'Kalél Sa Match – Réservation de terrains de football au Sénégal',
  description = 'Trouvez et réservez des terrains de football synthétiques partout au Sénégal. Paiement mobile, confirmation instantanée, carte interactive.',
  keywords = 'terrain football, sénégal, réservation terrain, kalel sa match, foot synthétique, dakar, wave, orange money',
  image = '/hero-bg.jpg',
  url = 'https://kalelsamatch.web.app',
  type = 'website',
  noindex = false,
}) => {
  useEffect(() => {
    // Title
    document.title = title;

    // Meta tags
    const metaTags: Record<string, string> = {
      'description': description,
      'keywords': keywords,
      'author': 'Kalél Sa Match',
      
      // Open Graph
      'og:title': title,
      'og:description': description,
      'og:image': image,
      'og:url': url,
      'og:type': type,
      'og:locale': 'fr_SN',
      'og:site_name': 'Kalél Sa Match',
      
      // Twitter
      'twitter:card': 'summary_large_image',
      'twitter:title': title,
      'twitter:description': description,
      'twitter:image': image,
      'twitter:url': url,
    };

    Object.entries(metaTags).forEach(([name, content]) => {
      const property = name.startsWith('og:') || name.startsWith('twitter:') ? 'property' : 'name';
      let meta = document.querySelector(`meta[${property}="${name}"]`);
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(property, name);
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    });

    // Noindex
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (noindex) {
      if (!robotsMeta) {
        robotsMeta = document.createElement('meta');
        robotsMeta.setAttribute('name', 'robots');
        document.head.appendChild(robotsMeta);
      }
      robotsMeta.setAttribute('content', 'noindex, nofollow');
    } else if (robotsMeta) {
      robotsMeta.remove();
    }

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;

  }, [title, description, keywords, image, url, type, noindex]);

  return null;
};

// Composant pour générer le JSON-LD Schema.org
export const TerrainSchema: React.FC<{
  terrain: {
    id: number;
    nom: string;
    description?: string;
    adresse?: string;
    latitude?: number;
    longitude?: number;
    prix_heure?: number;
    image_principale?: string;
  };
}> = ({ terrain }) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SportsActivityLocation',
    '@id': `https://kalelsamatch.web.app/terrains/${terrain.id}`,
    name: terrain.nom,
    description: terrain.description || `Terrain de football synthétique - ${terrain.nom}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: terrain.adresse,
      addressLocality: 'Dakar',
      addressCountry: 'SN',
    },
    geo: terrain.latitude && terrain.longitude ? {
      '@type': 'GeoCoordinates',
      latitude: terrain.latitude,
      longitude: terrain.longitude,
    } : undefined,
    image: terrain.image_principale ? `https://kalelsamatch.web.app${terrain.image_principale}` : undefined,
    priceRange: terrain.prix_heure ? `${terrain.prix_heure} CFA` : undefined,
    paymentAccepted: ['Orange Money', 'Wave', 'Carte Bancaire'],
    openingHours: 'Mo-Su 06:00-23:00',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

// Composant pour le breadcrumb Schema.org
export const BreadcrumbSchema: React.FC<{
  items: Array<{ name: string; url: string }>;
}> = ({ items }) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};
