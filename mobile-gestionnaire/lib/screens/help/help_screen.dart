import 'package:flutter/material.dart';

class HelpScreen extends StatelessWidget {
  const HelpScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Aide et Support'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildSection(
              context,
              Icons.help_outline,
              'Centre d\'aide',
              [
                _buildHelpItem(
                  context,
                  'Comment gérer mes terrains ?',
                  'Accédez à la section "Terrains" pour voir tous vos terrains. Vous pouvez modifier les prix, activer ou désactiver un terrain.',
                ),
                _buildHelpItem(
                  context,
                  'Comment gérer les réservations ?',
                  'Dans la section "Réservations", vous pouvez voir toutes les réservations de vos terrains, les confirmer ou les refuser.',
                ),
                _buildHelpItem(
                  context,
                  'Comment modifier le prix d\'un terrain ?',
                  'Sélectionnez un terrain dans la liste, puis utilisez le bouton "Modifier le prix" pour mettre à jour le tarif horaire.',
                ),
                _buildHelpItem(
                  context,
                  'Comment voir les statistiques ?',
                  'Le tableau de bord affiche vos statistiques : nombre de terrains, réservations du mois, revenus et taux d\'occupation.',
                ),
              ],
            ),
            const SizedBox(height: 24),
            _buildSection(
              context,
              Icons.contact_support,
              'Contactez-nous',
              [
                _buildContactItem(
                  context,
                  Icons.email,
                  'Email',
                  'contact@kalelsamatch.com',
                  'mailto:contact@kalelsamatch.com',
                ),
                _buildContactItem(
                  context,
                  Icons.phone,
                  'Téléphone',
                  '+221 77 123 45 67',
                  'tel:+221771234567',
                ),
                _buildContactItem(
                  context,
                  Icons.location_on,
                  'Adresse',
                  'Dakar, Sénégal',
                  null,
                ),
              ],
            ),
            const SizedBox(height: 24),
            _buildSection(
              context,
              Icons.info_outline,
              'Questions fréquentes',
              [
                _buildFAQItem(
                  context,
                  'Comment activer/désactiver un terrain ?',
                  'Dans la section "Terrains", sélectionnez un terrain et utilisez le bouton pour activer ou désactiver.',
                ),
                _buildFAQItem(
                  context,
                  'Que faire si une réservation est en retard ?',
                  'Vous pouvez contacter le client directement ou marquer la réservation comme terminée dans la section "Réservations".',
                ),
                _buildFAQItem(
                  context,
                  'Comment mettre à jour mes informations ?',
                  'Accédez à votre profil et cliquez sur l\'icône d\'édition à côté de chaque information pour la modifier.',
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSection(BuildContext context, IconData icon, String title, List<Widget> children) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, color: Theme.of(context).colorScheme.secondary),
                const SizedBox(width: 8),
                Text(
                  title,
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            ...children,
          ],
        ),
      ),
    );
  }

  Widget _buildHelpItem(BuildContext context, String question, String answer) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            question,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
          ),
          const SizedBox(height: 8),
          Text(
            answer,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Colors.grey[700],
                ),
          ),
        ],
      ),
    );
  }

  Widget _buildContactItem(BuildContext context, IconData icon, String label, String value, String? action) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: InkWell(
        onTap: action != null
            ? () {
                // TODO: Implémenter l'action (email, téléphone, etc.)
              }
            : null,
        child: Row(
          children: [
            Icon(icon, color: Theme.of(context).colorScheme.secondary, size: 24),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: Colors.grey[600],
                        ),
                  ),
                  Text(
                    value,
                    style: Theme.of(context).textTheme.bodyLarge,
                  ),
                ],
              ),
            ),
            if (action != null)
              Icon(Icons.chevron_right, color: Colors.grey[400]),
          ],
        ),
      ),
    );
  }

  Widget _buildFAQItem(BuildContext context, String question, String answer) {
    return ExpansionTile(
      title: Text(
        question,
        style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
      ),
      children: [
        Padding(
          padding: const EdgeInsets.all(16.0),
          child: Text(
            answer,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Colors.grey[700],
                ),
          ),
        ),
      ],
    );
  }
}

