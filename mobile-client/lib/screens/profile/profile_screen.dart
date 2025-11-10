import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/ksm_logo_icon.dart';
import '../terms/terms_screen.dart';
import '../privacy/privacy_screen.dart';
import '../help/help_screen.dart';
import 'edit_profile_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<AuthProvider>(context).user;

    return Scaffold(
      backgroundColor: Colors.grey.shade100,
      appBar: AppBar(
        title: const Text(
          'Profil',
          style: TextStyle(color: Colors.white),
        ),
        backgroundColor: Colors.green.shade600,
        elevation: 0,
        actions: [
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: KsmLogoIcon(size: 24, color: Colors.white),
          ),
        ],
      ),
      body: user == null
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              child: Column(
                children: [
                  const SizedBox(height: 16),
                  // Carte de profil avec avatar
                  Card(
                    margin: const EdgeInsets.symmetric(horizontal: 16),
                    elevation: 2,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(24.0),
                      child: Column(
                        children: [
                          CircleAvatar(
                            radius: 40,
                            backgroundColor: Colors.green.shade600,
                            child: Text(
                              '${user['prenom']?[0] ?? ''}${user['nom']?[0] ?? ''}'
                                  .toUpperCase(),
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 28,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          const SizedBox(height: 16),
                          Text(
                            '${user['prenom'] ?? ''} ${user['nom'] ?? ''}',
                            style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: Colors.black87,
                            ),
                          ),
                          if (user['email'] != null && user['email'].toString().isNotEmpty)
                            Padding(
                              padding: const EdgeInsets.only(top: 8),
                              child: Text(
                                user['email'] ?? '',
                                style: TextStyle(
                                  fontSize: 14,
                                  color: Colors.grey.shade600,
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  // Carte de contact
                  Card(
                    margin: const EdgeInsets.symmetric(horizontal: 16),
                    elevation: 2,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      children: [
                        _buildContactTile(
                          context,
                          Icons.email,
                          'Email',
                          user['email'] ?? 'Non renseigné',
                          'email',
                        ),
                        const Divider(height: 1),
                        _buildContactTile(
                          context,
                          Icons.phone,
                          'Téléphone',
                          user['telephone'] != null && user['telephone'].toString().isNotEmpty
                              ? (user['telephone'].toString().startsWith('+221')
                                  ? user['telephone'].toString()
                                  : '+221${user['telephone'].toString().replaceAll(RegExp(r'[^\d]'), '')}')
                              : 'Non renseigné',
                          'telephone',
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  // Informations personnelles
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: _buildSection(
                      context,
                      'Informations personnelles',
                      Icons.person,
                      [
                        _buildEditableInfoTile(
                          context,
                          Icons.person,
                          'Prénom',
                          user['prenom'] ?? 'Non renseigné',
                          'prenom',
                        ),
                        _buildEditableInfoTile(
                          context,
                          Icons.person_outline,
                          'Nom',
                          user['nom'] ?? 'Non renseigné',
                          'nom',
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  // Paramètres
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: _buildSection(
                      context,
                      'Paramètres',
                      Icons.settings,
                      [
                      _buildActionTile(
                        context,
                        Icons.description,
                        'Conditions d\'utilisation',
                        'Consulter les conditions',
                        () {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (context) => const TermsScreen(),
                            ),
                          );
                        },
                      ),
                      _buildActionTile(
                        context,
                        Icons.privacy_tip,
                        'Politique de confidentialité',
                        'Consulter la politique',
                        () {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (context) => const PrivacyScreen(),
                            ),
                          );
                        },
                      ),
                      _buildActionTile(
                        context,
                        Icons.help_outline,
                        'Aide et support',
                        'Besoin d\'aide ?',
                        () {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (context) => const HelpScreen(),
                            ),
                          );
                        },
                      ),
                    ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  // Déconnexion
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: () async {
                          final confirm = await showDialog<bool>(
                            context: context,
                            builder: (context) => AlertDialog(
                              title: const Text('Déconnexion'),
                              content: const Text(
                                'Êtes-vous sûr de vouloir vous déconnecter ?',
                              ),
                              actions: [
                                TextButton(
                                  onPressed: () => Navigator.of(context).pop(false),
                                  child: const Text('Annuler'),
                                ),
                                ElevatedButton(
                                  onPressed: () => Navigator.of(context).pop(true),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.red,
                                    foregroundColor: Colors.white,
                                  ),
                                  child: const Text('Déconnexion'),
                                ),
                              ],
                            ),
                          );

                          if (confirm == true && context.mounted) {
                            await Provider.of<AuthProvider>(context, listen: false)
                                .logout();
                          }
                        },
                        icon: const Icon(Icons.logout, color: Colors.white),
                        label: const Text(
                          'Se déconnecter',
                          style: TextStyle(color: Colors.white),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.red,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ),
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
    IconData icon,
    List<Widget> children,
  ) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Icon(icon, color: Theme.of(context).colorScheme.primary),
                const SizedBox(width: 8),
                Text(
                  title,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
              ],
            ),
          ),
          const Divider(height: 1),
          ...children,
        ],
      ),
    );
  }

  Widget _buildInfoTile(
    BuildContext context,
    IconData icon,
    String title,
    String value,
  ) {
    return ListTile(
      leading: Icon(icon, color: Theme.of(context).colorScheme.primary),
      title: Text(title),
      subtitle: Text(
        value,
        style: TextStyle(
          color: value == 'Non renseigné' ? Colors.grey : null,
        ),
      ),
      dense: true,
    );
  }

  Widget _buildActionTile(
    BuildContext context,
    IconData icon,
    String title,
    String subtitle,
    VoidCallback onTap,
  ) {
    return ListTile(
      leading: Icon(icon, color: Theme.of(context).colorScheme.primary),
      title: Text(title),
      subtitle: Text(
        subtitle,
        style: TextStyle(fontSize: 12, color: Colors.grey[600]),
      ),
      trailing: Icon(Icons.chevron_right, color: Colors.grey[400]),
      onTap: onTap,
      dense: true,
    );
  }

  Widget _buildEditableInfoTile(
    BuildContext context,
    IconData icon,
    String title,
    String value,
    String field,
  ) {
    return ListTile(
      leading: Icon(icon, color: Theme.of(context).colorScheme.primary),
      title: Text(title),
      subtitle: Text(
        value,
        style: TextStyle(
          color: value == 'Non renseigné' ? Colors.grey : null,
        ),
      ),
      trailing: Icon(Icons.edit, color: Theme.of(context).colorScheme.primary, size: 20),
      onTap: () async {
        final result = await Navigator.of(context).push(
          MaterialPageRoute(
            builder: (context) => EditProfileScreen(field: field),
          ),
        );
        if (result == true && context.mounted) {
          // Recharger le profil si la modification a réussi
          final authProvider = Provider.of<AuthProvider>(context, listen: false);
          await authProvider.loadUser();
        }
      },
      dense: true,
    );
  }

  Widget _buildContactTile(
    BuildContext context,
    IconData icon,
    String title,
    String value,
    String field,
  ) {
    return ListTile(
      leading: Icon(icon, color: Colors.green.shade600),
      title: Text(
        title,
        style: const TextStyle(
          fontWeight: FontWeight.w500,
          color: Colors.black87,
        ),
      ),
      subtitle: Text(
        value,
        style: TextStyle(
          color: value == 'Non renseigné' ? Colors.grey : Colors.grey.shade700,
          fontSize: 14,
        ),
      ),
      trailing: Icon(
        Icons.edit,
        color: Colors.green.shade600,
        size: 20,
      ),
      onTap: () async {
        final result = await Navigator.of(context).push(
          MaterialPageRoute(
            builder: (context) => EditProfileScreen(field: field),
          ),
        );
        if (result == true && context.mounted) {
          // Recharger le profil si la modification a réussi
          final authProvider = Provider.of<AuthProvider>(context, listen: false);
          await authProvider.loadUser();
        }
      },
      dense: true,
    );
  }
}
