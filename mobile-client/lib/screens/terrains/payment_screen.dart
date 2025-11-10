import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../widgets/ksm_logo_icon.dart';
import 'package:intl/intl.dart';

class PaymentScreen extends StatefulWidget {
  final Map<String, dynamic> subscriptionDetails;

  const PaymentScreen({
    super.key,
    required this.subscriptionDetails,
  });

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  final ApiService _apiService = ApiService();
  String _selectedPaymentMethod = 'mobile_money'; // mobile_money, wave, cash
  bool _isProcessing = false;

  double? _toDouble(dynamic value) {
    if (value == null) return null;
    if (value is double) return value;
    if (value is int) return value.toDouble();
    if (value is String) {
      return double.tryParse(value);
    }
    return null;
  }

  String _formatPrice(dynamic price) {
    if (price == null) return '0';
    final priceValue = price is num ? price.toDouble() : (double.tryParse(price.toString()) ?? 0.0);
    return priceValue.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]},',
    );
  }

  Future<void> _processPayment() async {
    if (_isProcessing) return;

    setState(() => _isProcessing = true);

    try {
      final subscriptionId = widget.subscriptionDetails['subscriptionId'];
      final acompte = _toDouble(widget.subscriptionDetails['acompte']) ?? 
                     (_toDouble(widget.subscriptionDetails['totalAmount']) ?? 0.0) * 0.30;

      // Convertir la méthode de paiement pour correspondre au backend
      String methodePaiement = _selectedPaymentMethod;
      if (_selectedPaymentMethod == 'mobile_money') {
        methodePaiement = 'mobile_money';
      } else if (_selectedPaymentMethod == 'wave') {
        methodePaiement = 'wave';
      } else if (_selectedPaymentMethod == 'cash') {
        // Pour le paiement sur place, utiliser mobile_money comme méthode par défaut
        methodePaiement = 'mobile_money';
      }

      final response = await _apiService.processSubscriptionPayment(
        subscriptionId: subscriptionId,
        montant: acompte, // Payer seulement l'acompte
        methodePaiement: methodePaiement,
      );

      if (mounted) {
        setState(() => _isProcessing = false);

        if (response['success'] == true) {
          // Afficher un message de succès et retourner
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Paiement traité avec succès !'),
              backgroundColor: Colors.green,
            ),
          );

          // Retourner à l'écran précédent après un court délai
          Future.delayed(const Duration(seconds: 1), () {
            if (mounted) {
              Navigator.of(context).popUntil((route) => route.isFirst);
            }
          });
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(response['message'] ?? 'Erreur lors du paiement'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isProcessing = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erreur: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final totalAmount = _toDouble(widget.subscriptionDetails['totalAmount']) ?? 0.0;
    final acompte = _toDouble(widget.subscriptionDetails['acompte']) ?? totalAmount * 0.30;
    final terrainName = widget.subscriptionDetails['terrainName'] ?? 'Terrain';
    final duration = widget.subscriptionDetails['duration'] ?? 'Abonnement';
    final startDate = widget.subscriptionDetails['startDate'];
    final endDate = widget.subscriptionDetails['endDate'];

      return Scaffold(
        appBar: AppBar(
          title: const Text('Paiement'),
          actions: [
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: KsmLogoIcon(size: 24, color: Colors.white),
            ),
          ],
        ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Résumé de l'abonnement
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Résumé de l\'abonnement',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    const SizedBox(height: 16),
                    _SummaryRow('Terrain', terrainName),
                    _SummaryRow('Type', duration),
                    if (startDate != null)
                      _SummaryRow('Date de début', _formatDate(startDate)),
                    if (endDate != null)
                      _SummaryRow('Date de fin', _formatDate(endDate)),
                    const Divider(),
                    _SummaryRow(
                      'Prix total',
                      '${_formatPrice(totalAmount)} FCFA',
                    ),
                    _SummaryRow(
                      'Acompte à payer (30%)',
                      '${_formatPrice(acompte)} FCFA',
                      isTotal: true,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Le solde sera payé ultérieurement',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: Colors.grey[600],
                            fontStyle: FontStyle.italic,
                          ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            // Méthode de paiement
            Text(
              'Méthode de paiement',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 16),
            _PaymentMethodOption(
              value: 'mobile_money',
              label: 'Orange Money',
              icon: Icons.phone_android,
              isSelected: _selectedPaymentMethod == 'mobile_money',
              onTap: () => setState(() => _selectedPaymentMethod = 'mobile_money'),
            ),
            const SizedBox(height: 12),
            _PaymentMethodOption(
              value: 'wave',
              label: 'Wave',
              icon: Icons.account_balance_wallet,
              isSelected: _selectedPaymentMethod == 'wave',
              onTap: () => setState(() => _selectedPaymentMethod = 'wave'),
            ),
            const SizedBox(height: 12),
            _PaymentMethodOption(
              value: 'cash',
              label: 'Paiement sur place',
              icon: Icons.money,
              isSelected: _selectedPaymentMethod == 'cash',
              onTap: () => setState(() => _selectedPaymentMethod = 'cash'),
            ),
            const SizedBox(height: 32),
            // Bouton payer
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isProcessing ? null : _processPayment,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Theme.of(context).colorScheme.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: _isProcessing
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                        ),
                      )
                    : Text(
                        'Payer l\'acompte de ${_formatPrice(_toDouble(widget.subscriptionDetails['acompte']) ?? totalAmount * 0.30)} FCFA',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatDate(dynamic date) {
    if (date == null) return '';
    try {
      if (date is String) {
        final parsed = DateTime.parse(date);
        return DateFormat('dd/MM/yyyy').format(parsed);
      }
      if (date is DateTime) {
        return DateFormat('dd/MM/yyyy').format(date);
      }
    } catch (e) {
      return date.toString();
    }
    return date.toString();
  }
}

class _SummaryRow extends StatelessWidget {
  final String label;
  final String value;
  final bool isTotal;

  const _SummaryRow(this.label, this.value, {this.isTotal = false});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontWeight: isTotal ? FontWeight.bold : FontWeight.normal,
              fontSize: isTotal ? 18 : 16,
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontWeight: isTotal ? FontWeight.bold : FontWeight.normal,
              fontSize: isTotal ? 18 : 16,
              color: isTotal ? Theme.of(context).colorScheme.primary : null,
            ),
          ),
        ],
      ),
    );
  }
}

class _PaymentMethodOption extends StatelessWidget {
  final String value;
  final String label;
  final IconData icon;
  final bool isSelected;
  final VoidCallback onTap;

  const _PaymentMethodOption({
    required this.value,
    required this.label,
    required this.icon,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected
              ? Theme.of(context).colorScheme.primaryContainer
              : Colors.grey[100],
          border: Border.all(
            color: isSelected
                ? Theme.of(context).colorScheme.primary
                : Colors.grey[300]!,
            width: isSelected ? 2 : 1,
          ),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Icon(
              icon,
              color: isSelected
                  ? Theme.of(context).colorScheme.primary
                  : Colors.grey[600],
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                label,
                style: TextStyle(
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                  color: isSelected
                      ? Theme.of(context).colorScheme.primary
                      : Colors.black87,
                ),
              ),
            ),
            if (isSelected)
              Icon(
                Icons.check_circle,
                color: Theme.of(context).colorScheme.primary,
              ),
          ],
        ),
      ),
    );
  }
}

