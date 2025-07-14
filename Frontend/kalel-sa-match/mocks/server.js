import { setupServer } from 'msw/node';
import { rest } from 'msw';

export const handlers = [
  // Mock de l'authentification
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        user: {
          id: '1',
          nom: 'Test',
          prenom: 'User',
          email: 'test@example.com',
          telephone: '1234567890',
          role: 'client',
          statut: 'actif',
          email_verifie: true,
          photo: null,
          adresse: null,
          date_naissance: null,
          nom_complet: 'Test User',
          role_label: 'Client',
          statut_label: 'Actif'
        },
        token: 'test-token'
      })
    );
  }),

  // Mock de l'inscription
  rest.post('/api/auth/register', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        user: {
          id: '2',
          nom: 'New',
          prenom: 'User',
          email: 'new@example.com',
          telephone: '0987654321',
          role: 'client',
          statut: 'en_attente',
          email_verifie: false,
          photo: null,
          adresse: null,
          date_naissance: null,
          nom_complet: 'New User',
          role_label: 'Client',
          statut_label: 'En attente'
        },
        token: 'new-token'
      })
    );
  }),

  // Mock de la déconnexion
  rest.post('/api/auth/logout', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ message: 'Déconnexion réussie' })
    );
  }),

  // Mock de la mise à jour du profil
  rest.put('/api/auth/update-profile', (req, res, ctx) => {
    const { nom, prenom } = req.body;
    return res(
      ctx.status(200),
      ctx.json({
        user: {
          id: '1',
          nom,
          prenom,
          email: 'test@example.com',
          telephone: '1234567890',
          role: 'client',
          statut: 'actif',
          email_verifie: true,
          photo: null,
          adresse: null,
          date_naissance: null,
          nom_complet: `${nom} ${prenom}`,
          role_label: 'Client',
          statut_label: 'Actif'
        }
      })
    );
  }),

  // Mock de la vérification du token
  rest.get('/api/auth/me', (req, res, ctx) => {
    const token = req.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return res(ctx.status(401));
    }
    return res(
      ctx.status(200),
      ctx.json({
        user: {
          id: '1',
          nom: 'Test',
          prenom: 'User',
          email: 'test@example.com',
          telephone: '1234567890',
          role: 'client',
          statut: 'actif',
          email_verifie: true,
          photo: null,
          adresse: null,
          date_naissance: null,
          nom_complet: 'Test User',
          role_label: 'Client',
          statut_label: 'Actif'
        }
      })
    );
  })
];

export const server = setupServer(...handlers);
