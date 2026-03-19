import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../services/api_service.dart';
import '../../providers/auth_provider.dart';
import '../../screens/main_navigation.dart';
import 'phone_auth_screen.dart';

class PinLoginScreen extends StatefulWidget {
  final String phoneNumber;

  const PinLoginScreen({
    super.key,
    required this.phoneNumber,
  });

  @override
  State<PinLoginScreen> createState() => _PinLoginScreenState();
}

class _PinLoginScreenState extends State<PinLoginScreen> {
  final _apiService = ApiService();
  final List<TextEditingController> _pinControllers = List.generate(4, (_) => TextEditingController());
  final List<FocusNode> _pinFocusNodes = List.generate(4, (_) => FocusNode());
  bool _isLoading = false;
  int _attempts = 0;
  static const int _maxAttempts = 3;

  @override
  void dispose() {
    for (var controller in _pinControllers) {
      controller.dispose();
    }
    for (var node in _pinFocusNodes) {
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

    // Vérifier si tous les champs sont remplis
    if (_pinControllers.every((controller) => controller.text.isNotEmpty)) {
      _login();
    }
  }

  Future<void> _login() async {
    final pin = _pinControllers.map((c) => c.text).join();
    if (pin.length != 4) return;

    setState(() => _isLoading = true);

    try {
      final response = await _apiService.loginWithPIN(
        telephone: widget.phoneNumber,
        pin: pin,
      );

      if (!mounted) return;
      setState(() => _isLoading = false);

      if (response['success'] == true && response['data'] != null) {
        // Sauvegarder le token
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', response['data']['token']);

        // Mettre à jour le provider d'authentification
        final authProvider = Provider.of<AuthProvider>(context, listen: false);
        await authProvider.loadUser();

        if (!mounted) return;
        // Aller à l'écran principal
        Navigator.of(context).pushAndRemoveUntil(
          MaterialPageRoute(builder: (context) => const MainNavigation()),
          (route) => false,
        );
      } else {
        if (!mounted) return;
        setState(() {
          _attempts++;
        });

        if (_attempts >= _maxAttempts) {
          // Trop de tentatives - retourner à l'écran de connexion avec OTP
          final prefs = await SharedPreferences.getInstance();
          await prefs.remove('has_pin');

          if (!mounted) return;
          Navigator.of(context).pushAndRemoveUntil(
            MaterialPageRoute(builder: (context) => const PhoneAuthScreen()),
            (route) => false,
          );
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Trop de tentatives. Veuillez vous reconnecter avec OTP'),
              backgroundColor: Colors.red,
            ),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(response['message'] ?? 'PIN incorrect'),
              backgroundColor: Colors.red,
            ),
          );
          // Effacer les champs
          for (var controller in _pinControllers) {
            controller.clear();
          }
          _pinFocusNodes[0].requestFocus();
        }
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

  Future<void> _logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('saved_phone');
    await prefs.remove('has_pin');

    if (!mounted) return;
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (context) => const PhoneAuthScreen()),
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Connexion'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: _logout,
            tooltip: 'Changer de compte',
          ),
        ],
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
                'Entrez votre PIN',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                widget.phoneNumber,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Colors.grey[600],
                    ),
                textAlign: TextAlign.center,
              ),
              if (_attempts > 0) ...[
                const SizedBox(height: 8),
                Text(
                  'Tentatives restantes: ${_maxAttempts - _attempts}',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Colors.red,
                      ),
                  textAlign: TextAlign.center,
                ),
              ],
              const SizedBox(height: 40),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: List.generate(4, (index) {
                  return SizedBox(
                    width: 60,
                    child: TextField(
                      controller: _pinControllers[index],
                      focusNode: _pinFocusNodes[index],
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
                      onChanged: (value) => _onPINChanged(index, value),
                    ),
                  );
                }),
              ),
              if (_isLoading) ...[
                const SizedBox(height: 24),
                const Center(child: CircularProgressIndicator()),
              ],
              const SizedBox(height: 24),
              TextButton(
                onPressed: _logout,
                child: const Text('Utiliser un autre numéro'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

