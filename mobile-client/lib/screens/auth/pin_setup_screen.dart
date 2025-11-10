import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import 'personal_info_screen.dart';

class PinSetupScreen extends StatefulWidget {
  final String phoneNumber;
  final String otpCode;

  const PinSetupScreen({
    super.key,
    required this.phoneNumber,
    required this.otpCode,
  });

  @override
  State<PinSetupScreen> createState() => _PinSetupScreenState();
}

class _PinSetupScreenState extends State<PinSetupScreen> {
  final _apiService = ApiService();
  final List<TextEditingController> _pinControllers = List.generate(4, (_) => TextEditingController());
  final List<TextEditingController> _confirmPinControllers = List.generate(4, (_) => TextEditingController());
  final List<FocusNode> _pinFocusNodes = List.generate(4, (_) => FocusNode());
  final List<FocusNode> _confirmPinFocusNodes = List.generate(4, (_) => FocusNode());
  bool _isLoading = false;
  bool _showConfirmPin = false;

  @override
  void dispose() {
    for (var controller in _pinControllers) {
      controller.dispose();
    }
    for (var controller in _confirmPinControllers) {
      controller.dispose();
    }
    for (var node in _pinFocusNodes) {
      node.dispose();
    }
    for (var node in _confirmPinFocusNodes) {
      node.dispose();
    }
    super.dispose();
  }

  void _onPINChanged(int index, String value) {
    if (value.length == 1 && index < 3) {
      _pinFocusNodes[index + 1].requestFocus();
    } else if (value.isEmpty && index > 0) {
      _pinFocusNodes[index - 1].requestFocus();
    }

    // Si tous les champs du PIN sont remplis, passer à la confirmation
    if (_pinControllers.every((controller) => controller.text.isNotEmpty) && !_showConfirmPin) {
      setState(() {
        _showConfirmPin = true;
      });
      Future.delayed(const Duration(milliseconds: 100), () {
        _confirmPinFocusNodes[0].requestFocus();
      });
    }

    // Vérifier si tous les champs de confirmation sont remplis
    if (_showConfirmPin && _confirmPinControllers.every((controller) => controller.text.isNotEmpty)) {
      _setPIN();
    }
  }

  void _onConfirmPINChanged(int index, String value) {
    if (value.length == 1 && index < 3) {
      _confirmPinFocusNodes[index + 1].requestFocus();
    } else if (value.isEmpty && index > 0) {
      _confirmPinFocusNodes[index - 1].requestFocus();
    }

    // Vérifier si tous les champs sont remplis
    if (_confirmPinControllers.every((controller) => controller.text.isNotEmpty)) {
      _setPIN();
    }
  }

  Future<void> _setPIN() async {
    final pin = _pinControllers.map((c) => c.text).join();
    final confirmPin = _confirmPinControllers.map((c) => c.text).join();

    if (pin.length != 4 || confirmPin.length != 4) return;

    if (pin != confirmPin) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Les PIN ne correspondent pas'),
          backgroundColor: Colors.red,
        ),
      );
      // Effacer la confirmation
      for (var controller in _confirmPinControllers) {
        controller.clear();
      }
      _confirmPinFocusNodes[0].requestFocus();
      return;
    }

    setState(() => _isLoading = true);

    try {
      final response = await _apiService.setPIN(widget.phoneNumber, pin, confirmPin);

      if (!mounted) return;
      setState(() => _isLoading = false);

      if (response['success'] == true) {
        if (!mounted) return;
        // Aller à l'écran des informations personnelles
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (context) => PersonalInfoScreen(
              phoneNumber: widget.phoneNumber,
              otpCode: widget.otpCode,
              pin: pin,
            ),
          ),
        );
      } else {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(response['message'] ?? 'Erreur lors de la définition du PIN'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Erreur: ${e.toString()}'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Créer un PIN'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 40),
              Icon(
                Icons.lock,
                size: 80,
                color: Theme.of(context).colorScheme.primary,
              ),
              const SizedBox(height: 24),
              Text(
                _showConfirmPin ? 'Confirmez votre PIN' : 'Créez un PIN à 4 chiffres',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                _showConfirmPin
                    ? 'Entrez à nouveau votre PIN pour confirmer'
                    : 'Ce PIN sera utilisé pour vous connecter rapidement',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Colors.grey[600],
                    ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 40),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: List.generate(4, (index) {
                  return SizedBox(
                    width: 60,
                    child: TextField(
                      controller: _showConfirmPin ? _confirmPinControllers[index] : _pinControllers[index],
                      focusNode: _showConfirmPin ? _confirmPinFocusNodes[index] : _pinFocusNodes[index],
                      textAlign: TextAlign.center,
                      keyboardType: TextInputType.number,
                      obscureText: true,
                      maxLength: 1,
                      decoration: InputDecoration(
                        counterText: '',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      onChanged: (value) => _showConfirmPin
                          ? _onConfirmPINChanged(index, value)
                          : _onPINChanged(index, value),
                    ),
                  );
                }),
              ),
              if (_isLoading) ...[
                const SizedBox(height: 24),
                const Center(child: CircularProgressIndicator()),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

