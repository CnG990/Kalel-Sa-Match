const { withSentryConfig } = require('@sentry/nextjs');

const moduleExports = {
  // Configuration Sentry
  sentry: {
    // DSN de votre projet Sentry
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Configuration spécifique à Next.js
    tracesSampleRate: 1.0, // 100% des transactions seront envoyées
    profilesSampleRate: 1.0, // 100% des profils seront envoyés

    // Configuration des performances
    performance: {
      // L'URL de votre projet Sentry
      url: process.env.NEXT_PUBLIC_SENTRY_URL,
      // Le nom de votre projet
      project: process.env.NEXT_PUBLIC_SENTRY_PROJECT,
      // Le token d'authentification
      authToken: process.env.NEXT_PUBLIC_SENTRY_AUTH_TOKEN,
    },

    // Configuration des logs
    integrations: [
      new Sentry.Integrations.Http({
        // Capture les erreurs HTTP
        captureContent: true,
        // Capture les erreurs de réseau
        captureNetworkErrors: true,
      }),
      new Sentry.Integrations.Breadcrumbs({
        // Capture les actions utilisateur
        console: true,
        http: true,
        dom: true,
      }),
    ],
  },

  // Configuration Next.js
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Configuration côté serveur
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = withSentryConfig(moduleExports);
