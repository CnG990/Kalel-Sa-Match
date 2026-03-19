import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:share_plus/share_plus.dart';
import '../../providers/reservation_provider.dart';
import '../../services/api_service.dart';
import '../../widgets/ksm_logo_icon.dart';
import 'package:intl/intl.dart';

class MyReservationsScreen extends StatefulWidget {
  const MyReservationsScreen({super.key});

  @override
  State<MyReservationsScreen> createState() => _MyReservationsScreenState();
}

class _MyReservationsScreenState extends State<MyReservationsScreen> {
  final ApiService _apiService = ApiService();

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

  String _getAddress(Map<String, dynamic> terrain) {
    final adresse = terrain['adresse'];
    if (adresse == null || adresse.toString().isEmpty || 
        adresse.toString() == 'null' || 
        adresse.toString() == 'Adresse non disponible') {
      return 'Adresse non disponible';
    }
    return adresse.toString();
  }

  Future<void> _showReservationDetails(BuildContext context, Map<String, dynamic> reservation) async {
    final terrain = reservation['terrain'] ?? {};
    final statut = reservation['statut'] ?? '';
    final canCancel = statut == 'confirmee' || statut == 'en_attente';
    
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        expand: false,
        builder: (context, scrollController) => SingleChildScrollView(
          controller: scrollController,
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                // Handle bar
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    margin: const EdgeInsets.only(bottom: 20),
                    decoration: BoxDecoration(
                      color: Colors.grey[300],
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                // Title
                Text(
                  terrain['nom'] ?? 'Terrain',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                const SizedBox(height: 16),
                // Address
                Row(
                  children: [
                    Icon(Icons.location_on, size: 20, color: Colors.grey[600]),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _getAddress(terrain),
                        style: Theme.of(context).textTheme.bodyLarge,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                // Date
                Row(
                  children: [
                    Icon(Icons.calendar_today, size: 20, color: Colors.grey[600]),
                    const SizedBox(width: 8),
                    Text(
                      _formatDate(reservation['date_debut'] ?? ''),
                      style: Theme.of(context).textTheme.bodyLarge,
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                // Price
                Row(
                  children: [
                    Icon(Icons.attach_money, size: 20, color: Colors.grey[600]),
                    const SizedBox(width: 8),
                    Text(
                      '${_formatPrice(reservation['montant_total'] ?? reservation['prix_total'] ?? 0)} CFA',
                      style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: Theme.of(context).colorScheme.primary,
                          ),
                    ),
                  ],
                ),
                if (reservation['code_ticket'] != null) ...[
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Icon(Icons.qr_code, size: 20, color: Colors.grey[600]),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Code: ${reservation['code_ticket']}',
                          style: const TextStyle(
                            fontFamily: 'monospace',
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
                const SizedBox(height: 24),
                // Action buttons
                if (canCancel)
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: () => _cancelReservation(context, reservation),
                      icon: const Icon(Icons.cancel_outlined),
                      label: const Text('Annuler ma réservation'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.red,
                        side: const BorderSide(color: Colors.red),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                    ),
                  ),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: () => _showQrCode(context, reservation),
                    icon: const Icon(Icons.qr_code),
                    label: const Text('Voir ou télécharger mon QR code'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Theme.of(context).colorScheme.primary,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _cancelReservation(BuildContext context, Map<String, dynamic> reservation) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Annuler la réservation'),
        content: const Text(
          'Êtes-vous sûr de vouloir annuler cette réservation ?\n\n'
          'Les conditions de remboursement s\'appliquent selon le délai d\'annulation.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Non'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(context).pop(true),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red, foregroundColor: Colors.white),
            child: const Text('Oui, annuler'),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    try {
      final response = await _apiService.cancelReservation(reservation['id']);
      
      if (!mounted) return;
      
      if (response['success'] == true) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Réservation annulée avec succès'),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.of(context).pop(); // Fermer le modal
        Provider.of<ReservationProvider>(context, listen: false).fetchMyReservations();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(response['message'] ?? 'Erreur lors de l\'annulation'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Erreur: ${e.toString()}'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<void> _showQrCode(BuildContext context, Map<String, dynamic> reservation) async {
    try {
      // Essayer d'abord d'obtenir le ticket
      final ticketResponse = await _apiService.getTicket(reservation['id']);
      
      if (ticketResponse['success'] == true && ticketResponse['data'] != null) {
        final ticketData = ticketResponse['data'];
        final qrCodeToken = ticketData['qr_code_token'] ?? reservation['code_ticket'];
        
        if (!mounted) return;
        _showQrCodeDialog(context, reservation, qrCodeToken, ticketData);
      } else {
        // Si pas de ticket, essayer d'obtenir le QR code directement
        final qrResponse = await _apiService.getReservationQrCode(reservation['id']);
        
        if (qrResponse['success'] == true && qrResponse['data'] != null) {
          final qrData = qrResponse['data'];
          final qrCodeToken = qrData['qr_code_token'] ?? reservation['code_ticket'];
          
          if (!mounted) return;
          _showQrCodeDialog(context, reservation, qrCodeToken, qrData);
        } else {
          // Générer un QR code localement avec le code ticket
          final codeTicket = reservation['code_ticket'] ?? 'RES-${reservation['id']}';
          if (!mounted) return;
          _showQrCodeDialog(context, reservation, codeTicket, null);
        }
      }
    } catch (e) {
      // En cas d'erreur, générer un QR code localement avec le code ticket
      final codeTicket = reservation['code_ticket'] ?? 'RES-${reservation['id']}';
      if (!mounted) return;
      _showQrCodeDialog(context, reservation, codeTicket, null);
    }
  }

  void _showQrCodeDialog(BuildContext context, Map<String, dynamic> reservation, String qrCodeData, Map<String, dynamic>? ticketData) {
    final terrain = reservation['terrain'] ?? {};
    
    showDialog(
      context: context,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Mon QR Code',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey[300]!),
                ),
                child: QrImageView(
                  data: qrCodeData,
                  version: QrVersions.auto,
                  size: 200,
                  backgroundColor: Colors.white,
                ),
              ),
              const SizedBox(height: 16),
              Text(
                terrain['nom'] ?? 'Terrain',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              if (reservation['code_ticket'] != null) ...[
                const SizedBox(height: 8),
                Text(
                  'Code: ${reservation['code_ticket']}',
                  style: const TextStyle(
                    fontFamily: 'monospace',
                    fontSize: 14,
                  ),
                ),
              ],
              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  OutlinedButton.icon(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(Icons.close),
                    label: const Text('Fermer'),
                  ),
                  ElevatedButton.icon(
                    onPressed: () => _shareQrCode(context, qrCodeData, reservation),
                    icon: const Icon(Icons.share),
                    label: const Text('Partager'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Theme.of(context).colorScheme.primary,
                      foregroundColor: Colors.white,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _shareQrCode(BuildContext context, String qrCodeData, Map<String, dynamic> reservation) async {
    try {
      final terrain = reservation['terrain'] ?? {};
      final message = 'Mon QR Code de réservation KSM\n\n'
          'Terrain: ${terrain['nom'] ?? 'Terrain'}\n'
          'Code: ${reservation['code_ticket'] ?? qrCodeData}\n'
          'Date: ${_formatDate(reservation['date_debut'] ?? '')}';
      
      await Share.share(message);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Erreur lors du partage: ${e.toString()}'),
          backgroundColor: Colors.red,
        ),
      );
    }
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
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Adresse non disponible pour cet itinéraire'),
            backgroundColor: Colors.orange,
          ),
        );
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
          if (!mounted) return;
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Impossible d\'ouvrir Google Maps. Veuillez installer Google Maps ou utiliser un navigateur.'),
              backgroundColor: Colors.red,
              duration: Duration(seconds: 3),
            ),
          );
        }
      }
    } catch (e) {
      // Gérer les erreurs silencieusement ou afficher un message
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Erreur lors de l\'ouverture de Google Maps: ${e.toString()}'),
          backgroundColor: Colors.red,
          duration: const Duration(seconds: 3),
        ),
      );
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
                  child: InkWell(
                    onTap: () => _showReservationDetails(context, reservation),
                    borderRadius: BorderRadius.circular(12),
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
                                color: _getStatusColor(statut).withValues(alpha: 0.1),
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
                                _getAddress(terrain),
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
                              color: Colors.blue.withValues(alpha: 0.1),
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

