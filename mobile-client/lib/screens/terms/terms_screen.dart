import 'package:flutter/material.dart';

class TermsScreen extends StatelessWidget {
  const TermsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Conditions d\'utilisation'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    Colors.green.shade600,
                    Colors.orange.shade500,
                  ],
                ),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                children: [
                  const Text(
                    'Conditions d\'Utilisation',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Kalél Sa Match',
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.white.withOpacity(0.9),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Section 1: Acceptation
            _buildSection(
              context,
              '1. Acceptation des Conditions',
              'En utilisant l\'application Kalél Sa Match, vous acceptez d\'être lié par ces conditions d\'utilisation. Si vous n\'acceptez pas ces conditions, veuillez ne pas utiliser notre service.',
            ),

            // Section 2: Description
            _buildSection(
              context,
              '2. Description du Service',
              'Kalél Sa Match est une application de réservation en ligne de terrains synthétiques à Dakar. Notre service permet aux utilisateurs de rechercher, consulter et réserver des terrains.',
            ),

            // Section 3: Réservations et Paiements
            _buildSection(
              context,
              '3. Réservations et Paiements',
              '• Les réservations sont confirmées uniquement après paiement\n'
              '• Un acompte de 5 000 FCFA est obligatoire pour toute réservation\n'
              '• Le solde doit être payé avant l\'utilisation du terrain\n'
              '• Nous acceptons Orange Money, Wave et les paiements en espèces',
            ),

            // Section 4: Règles d'Annulation
            _buildSection(
              context,
              '4. Règles d\'Annulation et de Remboursement',
              '',
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Annulation 12h+
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.green.shade50,
                      border: Border.all(color: Colors.green.shade200),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(Icons.check_circle, color: Colors.green.shade700, size: 20),
                            const SizedBox(width: 8),
                            Text(
                              'Annulation 12 heures ou plus avant le match',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: Colors.green.shade900,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          '• Remboursement complet de l\'acompte (5 000 FCFA)\n'
                          '• Aucun frais de retrait\n'
                          '• Remboursement effectué sous 24-48 heures par Orange Money',
                          style: TextStyle(
                            fontSize: 13,
                            color: Colors.green.shade800,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  // Annulation moins de 12h
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.red.shade50,
                      border: Border.all(color: Colors.red.shade200),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(Icons.cancel, color: Colors.red.shade700, size: 20),
                            const SizedBox(width: 8),
                            Text(
                              'Annulation moins de 12 heures avant le match',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: Colors.red.shade900,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          '• Perte définitive de l\'acompte (5 000 FCFA)\n'
                          '• Aucun remboursement possible\n'
                          '• L\'acompte est conservé pour compenser la perte de revenus',
                          style: TextStyle(
                            fontSize: 13,
                            color: Colors.red.shade800,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  // No-Show
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.orange.shade50,
                      border: Border.all(color: Colors.orange.shade200),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(Icons.warning, color: Colors.orange.shade700, size: 20),
                            const SizedBox(width: 8),
                            Text(
                              'Réservation manquée (No-Show)',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: Colors.orange.shade900,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          '• Perte totale de l\'acompte (5 000 FCFA)\n'
                          '• Pénalité supplémentaire : 5 000 FCFA (amende pour absence)\n'
                          '• Total perdu : 10 000 FCFA (acompte + pénalité)\n'
                          '• Cette pénalité doit être payée avant toute nouvelle réservation\n'
                          '• En cas de récidive, votre compte peut être suspendu',
                          style: TextStyle(
                            fontSize: 13,
                            color: Colors.orange.shade800,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Section 5: Règles d'Utilisation
            _buildSection(
              context,
              '5. Règles d\'Utilisation des Terrains',
              'En réservant un terrain, vous vous engagez à :\n'
              '• Respecter les horaires de votre créneau\n'
              '• Utiliser les équipements avec soin\n'
              '• Respecter les autres utilisateurs et le personnel\n'
              '• Ne pas dépasser la capacité maximale autorisée\n'
              '• Signaler tout dommage ou problème au gestionnaire',
            ),

            // Section 6: Contact
            _buildSection(
              context,
              '6. Contact',
              'Pour toute question concernant ces conditions d\'utilisation, contactez-nous :\n'
              '• Email : contact@kalelsamatch.com\n'
              '• Téléphone : +221 77 123 45 67\n'
              '• Adresse : Dakar, Sénégal',
            ),

            const SizedBox(height: 24),
            // Footer
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                '© ${DateTime.now().year} Kalél Sa Match. Tous droits réservés.',
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey.shade600,
                ),
                textAlign: TextAlign.center,
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildSection(
    BuildContext context,
    String title,
    String content, {
    Widget? child,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
          ),
          const SizedBox(height: 12),
          if (child != null)
            child
          else
            Text(
              content,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
        ],
      ),
    );
  }
}

