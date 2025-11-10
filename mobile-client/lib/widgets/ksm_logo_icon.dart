import 'package:flutter/material.dart';

/// Widget réutilisable pour afficher le logo KSM en petit icône
class KsmLogoIcon extends StatelessWidget {
  final double size;
  final Color? color;

  const KsmLogoIcon({
    super.key,
    this.size = 24,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Image.asset(
      'assets/images/logo.png',
      width: size,
      height: size,
      errorBuilder: (context, error, stackTrace) {
        // Fallback si l'image n'est pas trouvée
        return Icon(
          Icons.sports_soccer,
          size: size,
          color: color ?? Theme.of(context).colorScheme.primary,
        );
      },
    );
  }
}

