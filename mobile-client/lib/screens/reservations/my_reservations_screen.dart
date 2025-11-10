import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../providers/reservation_provider.dart';
import '../../widgets/ksm_logo_icon.dart';
import 'package:intl/intl.dart';

class MyReservationsScreen extends StatefulWidget {
  const MyReservationsScreen({super.key});

  @override
  State<MyReservationsScreen> createState() => _MyReservationsScreenState();
}

class _MyReservationsScreenState extends State<MyReservationsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<ReservationProvider>(context, listen: false)
          .fetchMyReservations();
    });
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'confirmee':
        return Colors.green;
      case 'en_attente':
        return Colors.orange;
      case 'annulée':
        return Colors.red;
      case 'terminee':
        return Colors.grey;
      default:
        return Colors.grey;
    }
  }

  String _formatDate(String dateString) {
    try {
      final date = DateTime.parse(dateString);
      return DateFormat('dd/MM/yyyy HH:mm').format(date);
    } catch (e) {
      return dateString;
    }
  }

  String _formatPrice(dynamic price) {
    if (price == null) return '0';
    if (price is num) {
      return price.toStringAsFixed(0);
    }
    if (price is String) {
      try {
        final numValue = double.parse(price);
        return numValue.toStringAsFixed(0);
      } catch (e) {
        return '0';
      }
    }
    return '0';
  }

  Future<void> _openGoogleMaps(double? latitude, double? longitude, String? address) async {
    try {
      Uri url;
      
      if (latitude != null && longitude != null) {
        // Ouvrir Google Maps avec l'itinéraire si on a les coordonnées
        url = Uri.parse('https://www.google.com/maps/dir/?api=1&destination=$latitude,$longitude');
      } else if (address != null && address.isNotEmpty && address != 'Adresse non disponible') {
        // Si pas de coordonnées, essayer avec l'adresse
        final encodedAddress = Uri.encodeComponent(address);
        url = Uri.parse('https://www.google.com/maps/search/?api=1&query=$encodedAddress');
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Adresse non disponible pour cet itinéraire'),
              backgroundColor: Colors.orange,
            ),
          );
        }
        return;
      }

      // Vérifier si on peut lancer l'URL
      final canLaunch = await canLaunchUrl(url);
      
      if (canLaunch) {
        await launchUrl(url, mode: LaunchMode.externalApplication);
      } else {
        // Si canLaunchUrl échoue, essayer quand même de lancer l'URL
        try {
          await launchUrl(url, mode: LaunchMode.externalApplication);
        } catch (e) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Impossible d\'ouvrir Google Maps. Veuillez installer Google Maps ou utiliser un navigateur.'),
                backgroundColor: Colors.red,
                duration: const Duration(seconds: 3),
              ),
            );
          }
        }
      }
    } catch (e) {
      // Gérer les erreurs silencieusement ou afficher un message
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erreur lors de l\'ouverture de Google Maps: ${e.toString()}'),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 3),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mes Réservations'),
        actions: [
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: KsmLogoIcon(size: 24, color: Colors.white),
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              Provider.of<ReservationProvider>(context, listen: false)
                  .fetchMyReservations();
            },
          ),
        ],
      ),
      body: Consumer<ReservationProvider>(
        builder: (context, provider, _) {
          if (provider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (provider.reservations.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.calendar_today_outlined,
                    size: 80,
                    color: Colors.grey[400],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Aucune réservation',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Vous n\'avez pas encore de réservations',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Colors.grey[600],
                        ),
                  ),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () => provider.fetchMyReservations(),
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: provider.reservations.length,
              itemBuilder: (context, index) {
                final reservation = provider.reservations[index];
                final statut = reservation['statut'] ?? '';
                final terrain = reservation['terrain'] ?? {};

                return Card(
                  margin: const EdgeInsets.only(bottom: 16),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                terrain['nom'] ?? 'Terrain',
                                style: Theme.of(context)
                                    .textTheme
                                    .titleLarge
                                    ?.copyWith(
                                      fontWeight: FontWeight.bold,
                                    ),
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 6,
                              ),
                              decoration: BoxDecoration(
                                color: _getStatusColor(statut).withOpacity(0.1),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(
                                statut.replaceAll('_', ' ').toUpperCase(),
                                style: TextStyle(
                                  color: _getStatusColor(statut),
                                  fontWeight: FontWeight.bold,
                                  fontSize: 11,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Icon(Icons.location_on,
                                size: 16, color: Colors.grey[600]),
                            const SizedBox(width: 4),
                            Expanded(
                              child: Text(
                                terrain['adresse'] ?? 'Adresse non disponible',
                                style: Theme.of(context).textTheme.bodyMedium,
                              ),
                            ),
                            if ((terrain['latitude'] != null && terrain['longitude'] != null) ||
                                (terrain['adresse'] != null && 
                                 terrain['adresse'].toString().isNotEmpty && 
                                 terrain['adresse'].toString() != 'Adresse non disponible' &&
                                 terrain['adresse'].toString() != 'null'))
                              IconButton(
                                icon: const Icon(Icons.directions, size: 20),
                                color: Theme.of(context).colorScheme.primary,
                                onPressed: () {
                                  final lat = terrain['latitude'] != null
                                      ? double.tryParse(terrain['latitude'].toString())
                                      : null;
                                  final lng = terrain['longitude'] != null
                                      ? double.tryParse(terrain['longitude'].toString())
                                      : null;
                                  final address = terrain['adresse']?.toString();
                                  _openGoogleMaps(lat, lng, address);
                                },
                                tooltip: 'Itinéraire Google Maps',
                              ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Icon(Icons.calendar_today,
                                size: 16, color: Colors.grey[600]),
                            const SizedBox(width: 4),
                            Text(
                              _formatDate(reservation['date_debut'] ?? ''),
                              style: Theme.of(context).textTheme.bodyMedium,
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Icon(Icons.attach_money,
                                size: 16, color: Colors.grey[600]),
                            const SizedBox(width: 4),
                            Text(
                              '${_formatPrice(reservation['montant_total'] ?? reservation['prix_total'] ?? 0)} CFA',
                              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                    fontWeight: FontWeight.bold,
                                    color: Theme.of(context).colorScheme.primary,
                                  ),
                            ),
                          ],
                        ),
                        if (reservation['code_ticket'] != null) ...[
                          const SizedBox(height: 8),
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: Colors.blue.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.qr_code, size: 16),
                                const SizedBox(width: 8),
                                Text(
                                  'Code: ${reservation['code_ticket']}',
                                  style: const TextStyle(
                                    fontFamily: 'monospace',
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}

