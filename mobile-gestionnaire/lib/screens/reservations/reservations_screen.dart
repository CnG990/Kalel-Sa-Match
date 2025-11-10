import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/reservation_provider.dart';
import 'reservation_detail_dialog.dart';
import '../tickets/qr_scanner_screen.dart';

class ReservationsScreen extends StatefulWidget {
  const ReservationsScreen({super.key});

  @override
  State<ReservationsScreen> createState() => _ReservationsScreenState();
}

class _ReservationsScreenState extends State<ReservationsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<ReservationProvider>(context, listen: false)
          .fetchReservations();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Réservations'),
        actions: [
          IconButton(
            icon: const Icon(Icons.qr_code_scanner),
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => const QrScannerScreen(),
                ),
              );
            },
            tooltip: 'Scanner QR Code',
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              Provider.of<ReservationProvider>(context, listen: false)
                  .fetchReservations();
            },
            tooltip: 'Actualiser',
          ),
        ],
      ),
      body: Column(
        children: [
          // Filter Chips
          Consumer<ReservationProvider>(
            builder: (context, provider, _) {
              return SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Row(
                  children: [
                    _FilterChip(
                      label: 'Toutes',
                      isSelected: provider.filter == 'toutes',
                      onTap: () => provider.setFilter('toutes'),
                    ),
                    const SizedBox(width: 8),
                    _FilterChip(
                      label: 'En attente',
                      isSelected: provider.filter == 'en_attente',
                      onTap: () => provider.setFilter('en_attente'),
                    ),
                    const SizedBox(width: 8),
                    _FilterChip(
                      label: 'Confirmées',
                      isSelected: provider.filter == 'confirmee',
                      onTap: () => provider.setFilter('confirmee'),
                    ),
                    const SizedBox(width: 8),
                    _FilterChip(
                      label: 'Terminées',
                      isSelected: provider.filter == 'terminee',
                      onTap: () => provider.setFilter('terminee'),
                    ),
                  ],
                ),
              );
            },
          ),
          // Reservations List
          Expanded(
            child: Consumer<ReservationProvider>(
              builder: (context, provider, _) {
                if (provider.isLoading) {
                  return const Center(child: CircularProgressIndicator());
                }

                if (provider.filteredReservations.isEmpty) {
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
                          provider.filter == 'toutes'
                              ? 'Aucune réservation trouvée'
                              : 'Aucune réservation ${provider.filter}',
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                color: Colors.grey[600],
                              ),
                        ),
                      ],
                    ),
                  );
                }

                return RefreshIndicator(
                  onRefresh: () => provider.fetchReservations(),
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: provider.filteredReservations.length,
                    itemBuilder: (context, index) {
                      final reservation = provider.filteredReservations[index];
                      return _ReservationCard(reservation: reservation);
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _FilterChip({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return FilterChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (_) => onTap(),
      selectedColor: Theme.of(context).colorScheme.primaryContainer,
      checkmarkColor: Theme.of(context).colorScheme.primary,
    );
  }
}

class _ReservationCard extends StatelessWidget {
  final Map<String, dynamic> reservation;

  const _ReservationCard({required this.reservation});

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
      return '${date.day}/${date.month}/${date.year} ${date.hour}:${date.minute.toString().padLeft(2, '0')}';
    } catch (e) {
      return dateString;
    }
  }

  String _formatTimeRange(String dateDebut, String dateFin) {
    try {
      final debut = DateTime.parse(dateDebut);
      final fin = DateTime.parse(dateFin);
      
      // Format: Date - Heure début à Heure fin
      final dateStr = '${debut.day}/${debut.month}/${debut.year}';
      final heureDebut = '${debut.hour.toString().padLeft(2, '0')}:${debut.minute.toString().padLeft(2, '0')}';
      final heureFin = '${fin.hour.toString().padLeft(2, '0')}:${fin.minute.toString().padLeft(2, '0')}';
      
      return '$dateStr • $heureDebut - $heureFin';
    } catch (e) {
      return dateDebut;
    }
  }

  String _formatDuration(String dateDebut, String dateFin) {
    try {
      final debut = DateTime.parse(dateDebut);
      final fin = DateTime.parse(dateFin);
      final duration = fin.difference(debut);
      final hours = duration.inHours;
      final minutes = duration.inMinutes % 60;
      
      if (hours > 0 && minutes > 0) {
        return '$hours h $minutes min';
      } else if (hours > 0) {
        return '$hours h';
      } else {
        return '$minutes min';
      }
    } catch (e) {
      return '';
    }
  }

  @override
  Widget build(BuildContext context) {
    final statut = reservation['statut'] ?? '';
    final terrain = reservation['terrain'] ?? {};
    final client = reservation['client'] ?? {};

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: InkWell(
        onTap: () {
          showDialog(
            context: context,
            builder: (_) => ReservationDetailDialog(reservation: reservation),
          );
        },
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
                  Icon(Icons.person, size: 16, color: Colors.grey[600]),
                  const SizedBox(width: 4),
                  Text(
                    '${client['prenom'] ?? ''} ${client['nom'] ?? ''}',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Icon(Icons.access_time, size: 16, color: Colors.grey[600]),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _formatTimeRange(
                            reservation['date_debut'] ?? '',
                            reservation['date_fin'] ?? reservation['date_debut'] ?? '',
                          ),
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                fontWeight: FontWeight.w500,
                              ),
                        ),
                        if (reservation['date_debut'] != null && reservation['date_fin'] != null)
                          Text(
                            'Durée: ${_formatDuration(reservation['date_debut'] ?? '', reservation['date_fin'] ?? '')}',
                            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                  color: Colors.grey[600],
                                  fontSize: 11,
                                ),
                          ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Icon(Icons.attach_money, size: 16, color: Colors.grey[600]),
                  const SizedBox(width: 4),
                  Text(
                    '${reservation['prix_total'] ?? 0} CFA',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: Theme.of(context).colorScheme.primary,
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
}

