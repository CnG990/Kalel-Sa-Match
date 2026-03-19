import 'package:flutter/material.dart';
import '../../widgets/ksm_logo_icon.dart';

class HelpScreen extends StatelessWidget {
  const HelpScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Aide et Support'),
        actions: [
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: KsmLogoIcon(size: 24, color: Colors.white),
          ),
        ],
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
                  'Comment réserver un terrain ?',
                  'Pour réserver un terrain, accédez à la carte, sélectionnez un terrain, choisissez la date et l\'heure, puis confirmez votre réservation.',
                ),
                _buildHelpItem(
                  context,
                  'Comment annuler une réservation ?',
                  'Vous pouvez annuler une réservation depuis la section "Mes Réservations". Les règles d\'annulation et de remboursement s\'appliquent selon le délai.',
                ),
                _buildHelpItem(
                  context,
                  'Comment payer une réservation ?',
                  'Le paiement se fait via Orange Money, Wave ou en espèces. Un acompte de 5 000 FCFA est requis pour confirmer la réservation.',
                ),
                _buildHelpItem(
                  context,
                  'Comment souscrire à un abonnement ?',
                  'Accédez aux détails d\'un terrain, cliquez sur "Abonnement", choisissez votre formule et configurez vos préférences.',
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
                  'Quels sont les horaires d\'ouverture ?',
                  'Les terrains sont généralement ouverts de 8h à 22h. Les horaires peuvent varier selon les terrains.',
                ),
                _buildFAQItem(
                  context,
                  'Puis-je modifier ma réservation ?',
                  'Oui, vous pouvez modifier votre réservation depuis "Mes Réservations", sous réserve de disponibilité.',
                ),
                _buildFAQItem(
                  context,
                  'Que faire en cas de problème ?',
                  'Contactez notre support client par email ou téléphone. Nous répondons généralement sous 24 heures.',
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
                Icon(icon, color: Theme.of(context).colorScheme.primary),
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
            Icon(icon, color: Theme.of(context).colorScheme.primary, size: 24),
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

