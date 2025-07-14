import '@testing-library/jest-dom';
import { server } from './mocks/server';

// Établir le serveur MSW avant tous les tests
beforeAll(() => server.listen());

// Réinitialiser les requêtes entre chaque test
afterEach(() => server.resetHandlers());

// Nettoyer le serveur MSW après tous les tests
afterAll(() => server.close());

// Mock des fonctions de navigation Next.js
global.___nextRouterMock = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  reload: jest.fn(),
  beforePopState: jest.fn(),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn()
  },
  isFallback: false,
  isLocaleDomain: false,
  isReady: true,
  defaultLocale: 'fr',
  domainLocales: [],
  isPreview: false,
  pathname: '/',
  route: '/',
  asPath: '/',
  basePath: '',
  query: {},
  locale: 'fr',
  locales: ['fr'],
  defaultLocale: 'fr'
};

// Mock de la fonction useRouter
global.useRouter = () => global.___nextRouterMock;

// Mock de la fonction useTranslation
global.useTranslation = () => ({
  t: (key: string) => key,
  i18n: {
    changeLanguage: jest.fn()
  }
});

// Mock de la fonction toast
global.toast = {
  success: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  warning: jest.fn()
};
