import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/reservation_provider.dart';

class ReservationDetailDialog extends StatelessWidget {
  final Map<String, dynamic> reservation;

  const ReservationDetailDialog({super.key, required this.reservation});

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

  Future<void> _updateStatus(BuildContext context, String newStatus) async {
    try {
      await Provider.of<ReservationProvider>(context, listen: false)
          .updateStatus(reservation['id'], newStatus);

      if (context.mounted) {
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Réservation ${newStatus == 'confirmee' ? 'confirmée' : (newStatus == 'annulee' ? 'annulée' : 'mise à jour')}'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erreur: ${e.toString()}')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final statut = reservation['statut'] ?? '';
    final terrain = reservation['terrain'] ?? {};
    final client = reservation['client'] ?? {};

    return Dialog(
      child: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      terrain['nom'] ?? 'Réservation',
                      style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
              const SizedBox(height: 16),
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
                  ),
                ),
              ),
              const SizedBox(height: 24),
              _DetailRow('Client', '${client['prenom'] ?? ''} ${client['nom'] ?? ''}'),
              _DetailRow('Téléphone', client['telephone'] ?? 'N/A'),
              _DetailRow('Adresse terrain', terrain['adresse'] ?? ''),
              _DetailRow('Date début', _formatDate(reservation['date_debut'] ?? '')),
              _DetailRow('Date fin', _formatDate(reservation['date_fin'] ?? '')),
              _DetailRow('Prix total', '${reservation['prix_total'] ?? 0} CFA'),
              if (reservation['code_ticket'] != null)
                _DetailRow('Code ticket', reservation['code_ticket']),
              const SizedBox(height: 24),
              // Actions
              if (statut == 'en_attente') ...[
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: () => _updateStatus(context, 'confirmee'),
                    icon: const Icon(Icons.check),
                    label: const Text('Confirmer'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: () => _updateStatus(context, 'annulee'),
                    icon: const Icon(Icons.close),
                    label: const Text('Refuser'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.red,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _DetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              label,
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: Colors.grey[700],
              ),
            ),
          ),
          Expanded(
            child: Text(value),
          ),
        ],
      ),
    );
  }
}

