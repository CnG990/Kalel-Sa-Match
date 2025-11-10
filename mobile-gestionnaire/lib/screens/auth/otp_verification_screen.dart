import 'package:flutter/material.dart';
import '../../services/api_service.dart';

class OTPVerificationScreen extends StatefulWidget {
  final String phoneNumber;
  final bool forUpdate; // Pour la mise à jour du téléphone

  const OTPVerificationScreen({
    super.key,
    required this.phoneNumber,
    this.forUpdate = false,
  });

  @override
  State<OTPVerificationScreen> createState() => _OTPVerificationScreenState();
}

class _OTPVerificationScreenState extends State<OTPVerificationScreen> {
  final _apiService = ApiService();
  final List<TextEditingController> _otpControllers = List.generate(6, (_) => TextEditingController());
  final List<FocusNode> _focusNodes = List.generate(6, (_) => FocusNode());
  bool _isLoading = false;
  String? _otpCode; // Pour le développement

  @override
  void initState() {
    super.initState();
    _requestOTP();
  }

  @override
  void dispose() {
    for (var controller in _otpControllers) {
      controller.dispose();
    }
    for (var node in _focusNodes) {
      node.dispose();
    }
    super.dispose();
  }

  Future<void> _requestOTP() async {
    setState(() => _isLoading = true);

    try {
      final response = await _apiService.sendOTP(widget.phoneNumber, forUpdate: widget.forUpdate);

      if (!mounted) return;
      setState(() => _isLoading = false);

      if (response['success'] == true) {
        // En développement, afficher le code OTP
        if (response['data'] != null && response['data']['otp_code'] != null) {
          setState(() {
            _otpCode = response['data']['otp_code'];
          });
        }
      } else {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(response['message'] ?? 'Erreur lors de l\'envoi du code OTP'),
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

  void _onOTPChanged(int index, String value) {
    if (value.length == 1 && index < 5) {
      _focusNodes[index + 1].requestFocus();
    } else if (value.isEmpty && index > 0) {
      _focusNodes[index - 1].requestFocus();
    }

    // Vérifier si tous les champs sont remplis
    if (_otpControllers.every((controller) => controller.text.isNotEmpty)) {
      _verifyOTP();
    }
  }

  Future<void> _verifyOTP() async {
    final otpCode = _otpControllers.map((c) => c.text).join();
    if (otpCode.length != 6) return;

    if (widget.forUpdate) {
      // Pour la mise à jour du téléphone, retourner directement le code OTP
      if (!mounted) return;
      Navigator.of(context).pop({'otp_code': otpCode});
      return;
    }

    // Pour l'authentification normale, on ne fait rien ici
    // (le gestionnaire utilise email/password)
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Vérification'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 40),
              Icon(
                Icons.sms,
                size: 80,
                color: Theme.of(context).colorScheme.primary,
              ),
              const SizedBox(height: 24),
              Text(
                'Entrez le code de vérification',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                'Nous avons envoyé un code à ${widget.phoneNumber}',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Colors.grey[600],
                    ),
                textAlign: TextAlign.center,
              ),
              // En développement, afficher le code OTP
              if (_otpCode != null) ...[
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.blue.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    'Code OTP (dev): $_otpCode',
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      color: Colors.blue,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
              ],
              const SizedBox(height: 40),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: List.generate(6, (index) {
                  return SizedBox(
                    width: 45,
                    child: TextField(
                      controller: _otpControllers[index],
                      focusNode: _focusNodes[index],
                      textAlign: TextAlign.center,
                      keyboardType: TextInputType.number,
                      maxLength: 1,
                      decoration: InputDecoration(
                        counterText: '',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      onChanged: (value) => _onOTPChanged(index, value),
                    ),
                  );
                }),
              ),
              const SizedBox(height: 24),
              if (_isLoading)
                const Center(child: CircularProgressIndicator())
              else
                TextButton(
                  onPressed: _requestOTP,
                  child: const Text('Renvoyer le code'),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

