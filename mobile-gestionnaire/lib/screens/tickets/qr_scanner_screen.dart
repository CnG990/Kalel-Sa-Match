import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../../services/api_service.dart';
import '../../widgets/ksm_logo_icon.dart';

class QrScannerScreen extends StatefulWidget {
  const QrScannerScreen({super.key});

  @override
  State<QrScannerScreen> createState() => _QrScannerScreenState();
}

class _QrScannerScreenState extends State<QrScannerScreen> {
  final ApiService _apiService = ApiService();
  final MobileScannerController _controller = MobileScannerController();
  bool _isScanning = true;
  bool _isValidating = false;
  Map<String, dynamic>? _validationResult;
  String? _error;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _validateTicket(String code) async {
    if (_isValidating) return;

    setState(() {
      _isValidating = true;
      _error = null;
      _validationResult = null;
    });

    try {
      final response = await _apiService.validateTicketCode(code.trim().toUpperCase());

      if (mounted) {
        if (response['success'] == true && response['data'] != null) {
          setState(() {
            _validationResult = response['data'];
            _isValidating = false;
          });
          
          // Arrêter le scan après validation réussie
          await _controller.stop();
          
          // Afficher un message de succès
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('✅ Ticket validé avec succès !'),
              backgroundColor: Colors.green,
              duration: Duration(seconds: 2),
            ),
          );
        } else {
          setState(() {
            _error = response['message'] ?? 'Code de ticket invalide';
            _isValidating = false;
          });
          
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('❌ ${_error}'),
              backgroundColor: Colors.red,
              duration: const Duration(seconds: 2),
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = 'Erreur: ${e.toString()}';
          _isValidating = false;
        });
        
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('❌ Erreur: ${e.toString()}'),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 2),
          ),
        );
      }
    }
  }

  void _onCodeDetect(BarcodeCapture capture) {
    if (!_isScanning || _isValidating) return;

    final List<Barcode> barcodes = capture.barcodes;
    if (barcodes.isEmpty) return;

    final String? code = barcodes.first.rawValue;
    if (code == null || code.isEmpty) return;

    // Arrêter temporairement le scan
    setState(() {
      _isScanning = false;
    });

    // Valider le ticket
    _validateTicket(code);
  }

  void _resetScan() {
    setState(() {
      _isScanning = true;
      _isValidating = false;
      _validationResult = null;
      _error = null;
    });
    _controller.start();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Scanner QR Code'),
        actions: [
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: KsmLogoIcon(size: 24, color: Colors.white),
          ),
        ],
      ),
      body: Column(
        children: [
          // Zone de scan
          Expanded(
            flex: 3,
            child: Stack(
              children: [
                MobileScanner(
                  controller: _controller,
                  onDetect: _onCodeDetect,
                ),
                // Overlay avec guide
                Container(
                  decoration: BoxDecoration(
                    border: Border.all(
                      color: _isValidating 
                          ? Colors.orange 
                          : (_error != null ? Colors.red : Colors.green),
                      width: 3,
                    ),
                  ),
                  child: Center(
                    child: Container(
                      width: 250,
                      height: 250,
                      decoration: BoxDecoration(
                        border: Border.all(
                          color: _isValidating 
                              ? Colors.orange 
                              : (_error != null ? Colors.red : Colors.green),
                          width: 2,
                        ),
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                ),
                // Indicateur de chargement
                if (_isValidating)
                  Container(
                    color: Colors.black.withOpacity(0.5),
                    child: const Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          CircularProgressIndicator(color: Colors.white),
                          SizedBox(height: 16),
                          Text(
                            'Validation en cours...',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
          ),
          // Résultat de validation
          if (_validationResult != null)
            Expanded(
              flex: 2,
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.green[50],
                  border: Border(
                    top: BorderSide(color: Colors.green, width: 2),
                  ),
                ),
                child: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.check_circle, color: Colors.green, size: 32),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              'Ticket validé avec succès !',
                              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                    fontWeight: FontWeight.bold,
                                    color: Colors.green,
                                  ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      if (_validationResult!['reservation'] != null) ...[
                        _buildInfoRow(
                          'Code ticket',
                          _validationResult!['reservation']?['code_ticket'] ?? 'N/A',
                          Icons.confirmation_number,
                        ),
                        const Divider(),
                        _buildInfoRow(
                          'Terrain',
                          _validationResult!['reservation']?['terrain']?['nom'] ?? 'N/A',
                          Icons.sports_soccer,
                        ),
                        const Divider(),
                        _buildInfoRow(
                          'Client',
                          '${_validationResult!['reservation']?['user']?['prenom'] ?? ''} ${_validationResult!['reservation']?['user']?['nom'] ?? ''}',
                          Icons.person,
                        ),
                        const Divider(),
                        _buildInfoRow(
                          'Date',
                          _formatDate(_validationResult!['reservation']?['date_debut'] ?? ''),
                          Icons.calendar_today,
                        ),
                        const Divider(),
                        _buildInfoRow(
                          'Statut',
                          _validationResult!['reservation']?['statut'] ?? 'N/A',
                          Icons.info,
                        ),
                      ],
                      const SizedBox(height: 16),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: _resetScan,
                          icon: const Icon(Icons.refresh),
                          label: const Text('Scanner un autre ticket'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.green,
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
          // Zone de saisie manuelle
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.grey[100],
              border: Border(
                top: BorderSide(color: Colors.grey[300]!),
              ),
            ),
            child: Column(
              children: [
                TextField(
                  decoration: InputDecoration(
                    labelText: 'Ou saisir le code manuellement',
                    hintText: 'TSK-KSM-2025-XXXXXX',
                    prefixIcon: const Icon(Icons.confirmation_number),
                    suffixIcon: IconButton(
                      icon: const Icon(Icons.search),
                      onPressed: () {
                        final code = TextEditingController();
                        showDialog(
                          context: context,
                          builder: (context) => AlertDialog(
                            title: const Text('Saisir le code'),
                            content: TextField(
                              controller: code,
                              decoration: const InputDecoration(
                                hintText: 'TSK-KSM-2025-XXXXXX',
                              ),
                              autofocus: true,
                            ),
                            actions: [
                              TextButton(
                                onPressed: () => Navigator.pop(context),
                                child: const Text('Annuler'),
                              ),
                              ElevatedButton(
                                onPressed: () {
                                  if (code.text.isNotEmpty) {
                                    Navigator.pop(context);
                                    _validateTicket(code.text.trim().toUpperCase());
                                  }
                                },
                                child: const Text('Valider'),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
                if (_error != null && _validationResult == null)
                  Container(
                    margin: const EdgeInsets.only(top: 8),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.red[50],
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.red),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.error, color: Colors.red),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            _error!,
                            style: const TextStyle(color: Colors.red),
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.close, color: Colors.red),
                          onPressed: () {
                            setState(() {
                              _error = null;
                            });
                            _resetScan();
                          },
                        ),
                      ],
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, IconData icon) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Icon(icon, size: 20, color: Colors.grey[600]),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[600],
                  ),
                ),
                Text(
                  value,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _formatDate(String dateString) {
    if (dateString.isEmpty) return 'N/A';
    try {
      final date = DateTime.parse(dateString);
      return '${date.day}/${date.month}/${date.year} ${date.hour}:${date.minute.toString().padLeft(2, '0')}';
    } catch (e) {
      return dateString;
    }
  }
}

