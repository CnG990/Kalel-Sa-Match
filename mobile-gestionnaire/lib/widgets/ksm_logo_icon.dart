import 'package:flutter/material.dart';

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
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: color ?? Theme.of(context).colorScheme.primary,
        borderRadius: BorderRadius.circular(size / 4),
      ),
      child: Icon(
        Icons.sports_soccer,
        size: size * 0.7,
        color: Colors.white,
      ),
    );
  }
}

