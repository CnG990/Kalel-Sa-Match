import 'package:flutter/material.dart';
import '../../widgets/ksm_logo_icon.dart';

class PrivacyScreen extends StatelessWidget {
  const PrivacyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Politique de Confidentialité'),
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
            Text(
              'Dernière mise à jour : ${DateTime.now().day}/${DateTime.now().month}/${DateTime.now().year}',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.grey),
            ),
            const SizedBox(height: 24),
            _buildSectionTitle(context, '1. Introduction'),
            _buildParagraph(
              'Kalél Sa Match s\'engage à protéger votre vie privée et vos données personnelles. Cette politique de confidentialité explique comment nous collectons, utilisons, stockons et protégeons vos informations lorsque vous utilisez notre application.',
            ),
            const SizedBox(height: 16),
            _buildSectionTitle(context, '2. Informations que nous collectons'),
            _buildSubSectionTitle(context, 'Informations personnelles :'),
            _buildBulletPoint('Nom et prénom'),
            _buildBulletPoint('Adresse email'),
            _buildBulletPoint('Numéro de téléphone'),
            _buildBulletPoint('Informations de paiement (traitées de manière sécurisée)'),
            _buildSubSectionTitle(context, 'Informations techniques :'),
            _buildBulletPoint('Adresse IP'),
            _buildBulletPoint('Type d\'appareil et système d\'exploitation'),
            _buildBulletPoint('Données de géolocalisation (avec votre consentement)'),
            const SizedBox(height: 16),
            _buildSectionTitle(context, '3. Comment nous utilisons vos informations'),
            _buildParagraph(
              'Nous utilisons vos informations pour :',
            ),
            _buildBulletPoint('Créer et gérer votre compte utilisateur'),
            _buildBulletPoint('Traiter vos réservations et paiements'),
            _buildBulletPoint('Vous contacter concernant vos réservations'),
            _buildBulletPoint('Améliorer nos services et l\'expérience utilisateur'),
            _buildBulletPoint('Assurer la sécurité de notre application'),
            _buildBulletPoint('Respecter nos obligations légales'),
            const SizedBox(height: 16),
            _buildSectionTitle(context, '4. Partage de vos informations'),
            _buildParagraph(
              'Nous ne vendons, ne louons ni ne partageons vos informations personnelles avec des tiers, sauf dans les cas suivants :',
            ),
            _buildBulletPoint('Avec votre consentement explicite'),
            _buildBulletPoint('Pour fournir nos services (processeurs de paiement, etc.)'),
            _buildBulletPoint('Pour respecter une obligation légale'),
            _buildBulletPoint('Pour protéger nos droits et notre sécurité'),
            const SizedBox(height: 16),
            _buildSectionTitle(context, '5. Sécurité de vos données'),
            _buildParagraph(
              'Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos informations personnelles contre l\'accès non autorisé, la modification, la divulgation ou la destruction. Cependant, aucune méthode de transmission sur Internet ou de stockage électronique n\'est totalement sécurisée.',
            ),
            const SizedBox(height: 16),
            _buildSectionTitle(context, '6. Vos droits'),
            _buildParagraph(
              'Vous avez le droit de :',
            ),
            _buildBulletPoint('Accéder à vos données personnelles'),
            _buildBulletPoint('Corriger vos données personnelles'),
            _buildBulletPoint('Supprimer vos données personnelles'),
            _buildBulletPoint('Vous opposer au traitement de vos données'),
            _buildBulletPoint('Demander la portabilité de vos données'),
            const SizedBox(height: 16),
            _buildSectionTitle(context, '7. Cookies et technologies similaires'),
            _buildParagraph(
              'Nous utilisons des cookies et des technologies similaires pour améliorer votre expérience, analyser l\'utilisation de l\'application et personnaliser le contenu. Vous pouvez gérer vos préférences de cookies dans les paramètres de votre appareil.',
            ),
            const SizedBox(height: 16),
            _buildSectionTitle(context, '8. Conservation des données'),
            _buildParagraph(
              'Nous conservons vos données personnelles aussi longtemps que nécessaire pour fournir nos services et respecter nos obligations légales. Lorsque vous supprimez votre compte, nous supprimons vos données personnelles dans un délai raisonnable.',
            ),
            const SizedBox(height: 16),
            _buildSectionTitle(context, '9. Modifications de cette politique'),
            _buildParagraph(
              'Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. Les modifications seront publiées sur cette page avec une nouvelle date de mise à jour. Votre utilisation continue de l\'application après publication des modifications constitue votre acceptation des nouvelles conditions.',
            ),
            const SizedBox(height: 16),
            _buildSectionTitle(context, '10. Contact'),
            _buildParagraph(
              'Pour toute question concernant cette politique de confidentialité ou vos données personnelles, contactez-nous :',
            ),
            _buildContactInfo(context),
            const SizedBox(height: 24),
            Center(
              child: Text(
                '© ${DateTime.now().year} Kalél Sa Match. Tous droits réservés.',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.grey),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(BuildContext context, String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Text(
        title,
        style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
      ),
    );
  }

  Widget _buildSubSectionTitle(BuildContext context, String title) {
    return Padding(
      padding: const EdgeInsets.only(top: 8.0, bottom: 4.0),
      child: Text(
        title,
        style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
      ),
    );
  }

  Widget _buildParagraph(String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Text(
        text,
        style: const TextStyle(fontSize: 15),
      ),
    );
  }

  Widget _buildBulletPoint(String text) {
    return Padding(
      padding: const EdgeInsets.only(left: 16.0, top: 4.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('• ', style: TextStyle(fontSize: 15)),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(fontSize: 15),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContactInfo(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12.0),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(8.0),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildContactRow(Icons.email, 'Email', 'contact@kalelsamatch.com'),
          _buildContactRow(Icons.phone, 'Téléphone', '+221 77 123 45 67'),
          _buildContactRow(Icons.location_on, 'Adresse', 'Dakar, Sénégal'),
        ],
      ),
    );
  }

  Widget _buildContactRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        children: [
          Icon(icon, size: 18, color: Colors.grey.shade700),
          const SizedBox(width: 8),
          Text(
            '$label : ',
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontSize: 14),
            ),
          ),
        ],
      ),
    );
  }
}

