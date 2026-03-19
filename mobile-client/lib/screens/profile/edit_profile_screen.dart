import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';
import '../../widgets/ksm_logo_icon.dart';
import '../auth/otp_verification_screen.dart' as otp;

class EditProfileScreen extends StatefulWidget {
  final String field; // 'nom', 'prenom', 'email', 'telephone'

  const EditProfileScreen({
    super.key,
    required this.field,
  });

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  final _controller = TextEditingController();
  final _apiService = ApiService();
  bool _isLoading = false;
  String? _otpCode;
  String? _newPhone;

  @override
  void initState() {
    super.initState();
    final user = Provider.of<AuthProvider>(context, listen: false).user;
    if (user != null) {
      switch (widget.field) {
        case 'nom':
          _controller.text = user['nom'] ?? '';
          break;
        case 'prenom':
          _controller.text = user['prenom'] ?? '';
          break;
        case 'email':
          _controller.text = user['email'] ?? '';
          break;
        case 'telephone':
          _controller.text = user['telephone']?.toString().replaceAll('+221', '') ?? '';
          break;
      }
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  String _normalizePhone(String phone) {
    phone = phone.replaceAll(RegExp(r'[^\d]'), '');
    return phone;
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      if (widget.field == 'telephone') {
        // Pour le téléphone, on doit d'abord envoyer un OTP
        final normalizedPhone = _normalizePhone(_controller.text);
        _newPhone = normalizedPhone;

        final otpResponse = await _apiService.sendOTP(normalizedPhone, forUpdate: true);

        if (!mounted) return;
        setState(() => _isLoading = false);

        if (otpResponse['success'] == true) {
          // Naviguer vers l'écran de vérification OTP
          final result = await Navigator.of(context).push(
            MaterialPageRoute(
              builder: (context) => otp.OtpVerificationScreen(
                phoneNumber: normalizedPhone,
                forUpdate: true,
              ),
            ),
          );

          if (result != null && result['otp_code'] != null && mounted) {
            // Vérifier l'OTP et mettre à jour le téléphone
            await _updatePhoneWithOTP(result['otp_code']);
          }
        } else {
          if (!mounted) return;
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(otpResponse['message'] ?? 'Erreur lors de l\'envoi de l\'OTP'),
              backgroundColor: Colors.red,
            ),
          );
        }
      } else {
        // Pour nom, prénom et email, mise à jour directe
        final updateData = <String, String>{};
        switch (widget.field) {
          case 'nom':
            updateData['nom'] = _controller.text.trim();
            break;
          case 'prenom':
            updateData['prenom'] = _controller.text.trim();
            break;
          case 'email':
            updateData['email'] = _controller.text.trim();
            break;
        }

        final response = await _apiService.updateProfile(
          nom: updateData['nom'],
          prenom: updateData['prenom'],
          email: updateData['email'],
        );

        if (!mounted) return;
        setState(() => _isLoading = false);

        if (response['success'] == true) {
          // Mettre à jour le provider
          final authProvider = Provider.of<AuthProvider>(context, listen: false);
          await authProvider.loadUser();

          if (!mounted) return;
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Profil mis à jour avec succès'),
              backgroundColor: Colors.green,
            ),
          );
          Navigator.of(context).pop(true);
        } else {
          if (!mounted) return;
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(response['message'] ?? 'Erreur lors de la mise à jour'),
              backgroundColor: Colors.red,
            ),
          );
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

  Future<void> _updatePhoneWithOTP(String otpCode) async {
    if (_newPhone == null) return;

    setState(() => _isLoading = true);

    try {
      final response = await _apiService.updatePhoneWithOTP(
        nouveauTelephone: _newPhone!,
        otpCode: otpCode,
      );

      if (!mounted) return;
      setState(() => _isLoading = false);

      if (response['success'] == true) {
        // Mettre à jour le provider
        final authProvider = Provider.of<AuthProvider>(context, listen: false);
        await authProvider.loadUser();

        // Mettre à jour le numéro sauvegardé
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('saved_phone', _newPhone!);

        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Numéro de téléphone mis à jour avec succès'),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.of(context).pop(true);
      } else {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(response['message'] ?? 'Erreur lors de la mise à jour'),
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

  String _getFieldLabel() {
    switch (widget.field) {
      case 'nom':
        return 'Nom';
      case 'prenom':
        return 'Prénom';
      case 'email':
        return 'Email';
      case 'telephone':
        return 'Téléphone';
      default:
        return '';
    }
  }

  String? _getFieldHint() {
    switch (widget.field) {
      case 'nom':
        return 'Entrez votre nom';
      case 'prenom':
        return 'Entrez votre prénom';
      case 'email':
        return 'Entrez votre adresse email';
      case 'telephone':
        return 'Entrez votre numéro de téléphone';
      default:
        return '';
    }
  }

  TextInputType _getKeyboardType() {
    switch (widget.field) {
      case 'email':
        return TextInputType.emailAddress;
      case 'telephone':
        return TextInputType.phone;
      default:
        return TextInputType.text;
    }
  }

  String? _validate(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Ce champ est obligatoire';
    }

    switch (widget.field) {
      case 'email':
        if (!value.contains('@') || !value.contains('.')) {
          return 'Adresse email invalide';
        }
        break;
      case 'telephone':
        final normalized = _normalizePhone(value);
        if (normalized.length < 9 || normalized.length > 15) {
          return 'Numéro de téléphone invalide (9 à 15 chiffres)';
        }
        break;
    }

    return null;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Modifier ${_getFieldLabel()}'),
        actions: [
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: KsmLogoIcon(size: 24, color: Colors.white),
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 40),
                Icon(
                  widget.field == 'nom' || widget.field == 'prenom'
                      ? Icons.person
                      : widget.field == 'email'
                          ? Icons.email
                          : Icons.phone,
                  size: 80,
                  color: Theme.of(context).colorScheme.primary,
                ),
                const SizedBox(height: 24),
                Text(
                  'Modifier ${_getFieldLabel().toLowerCase()}',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                if (widget.field == 'telephone')
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.blue.shade50,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.blue.shade200),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.info_outline, color: Colors.blue.shade700, size: 20),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'Un code OTP sera envoyé à votre nouveau numéro pour confirmer la modification.',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.blue.shade900,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                const SizedBox(height: 40),
                TextFormField(
                  controller: _controller,
                  keyboardType: _getKeyboardType(),
                  decoration: InputDecoration(
                    labelText: _getFieldLabel(),
                    hintText: _getFieldHint(),
                    prefixIcon: Icon(
                      widget.field == 'nom' || widget.field == 'prenom'
                          ? Icons.person
                          : widget.field == 'email'
                              ? Icons.email
                              : Icons.phone,
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  validator: _validate,
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: _isLoading ? null : _save,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text('Enregistrer'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

