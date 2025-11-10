import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';
import 'dart:convert';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final ApiService _apiService = ApiService();
  Map<String, dynamic>? _stats;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadStats();
  }

  Future<void> _loadStats() async {
    try {
      setState(() => _isLoading = true);
      final response = await _apiService.getManagerStats();
      if (response['success'] == true) {
        setState(() => _stats = response['data']);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erreur: ${e.toString()}')),
        );
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  String _formatNumber(dynamic value) {
    // Convertir en num de manière sécurisée
    num numValue = 0;
    if (value is num) {
      numValue = value;
    } else if (value is String) {
      numValue = num.tryParse(value) ?? 0;
    }
    return numValue.toString();
  }

  String _formatCurrency(dynamic amount) {
    // Convertir en int de manière sécurisée
    int amountValue = 0;
    if (amount is int) {
      amountValue = amount;
    } else if (amount is num) {
      amountValue = amount.toInt();
    } else if (amount is String) {
      amountValue = int.tryParse(amount) ?? 0;
    }
    
    return '${amountValue.toString().replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]},',
    )} CFA';
  }

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<AuthProvider>(context).user;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Tableau de bord'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadStats,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadStats,
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Welcome Card
                    if (user != null)
                      Card(
                        color: Theme.of(context).colorScheme.primaryContainer,
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Row(
                            children: [
                              CircleAvatar(
                                radius: 30,
                                backgroundColor:
                                    Theme.of(context).colorScheme.primary,
                                child: Text(
                                  '${user['prenom']?[0] ?? ''}${user['nom']?[0] ?? ''}'
                                      .toUpperCase(),
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Bonjour, ${user['prenom'] ?? ''}',
                                      style: Theme.of(context)
                                          .textTheme
                                          .titleLarge
                                          ?.copyWith(
                                            fontWeight: FontWeight.bold,
                                          ),
                                    ),
                                    Text(
                                      'Vue d\'ensemble de votre activité',
                                      style: Theme.of(context)
                                          .textTheme
                                          .bodyMedium
                                          ?.copyWith(
                                            color: Colors.grey[600],
                                          ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    const SizedBox(height: 24),
                    // Stats Grid
                    if (_stats != null) ...[
                      GridView.count(
                        crossAxisCount: 2,
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        crossAxisSpacing: 12,
                        mainAxisSpacing: 12,
                        childAspectRatio: 1.1,
                        children: [
                          _StatCard(
                            icon: Icons.sports_soccer,
                            title: 'Terrains',
                            value: _formatNumber(_stats!['total_terrains'] ?? 0),
                            color: Colors.green,
                          ),
                          _StatCard(
                            icon: Icons.calendar_today,
                            title: 'Réservations',
                            value: _formatNumber(_stats!['reservations_mois'] ?? 0),
                            subtitle: 'Ce mois',
                            color: Colors.blue,
                          ),
                          _StatCard(
                            icon: Icons.attach_money,
                            title: 'Revenus',
                            value: _formatCurrency(
                              _stats!['revenus_mois'] ?? 0,
                            ),
                            subtitle: 'Ce mois',
                            color: Colors.orange,
                          ),
                          _StatCard(
                            icon: Icons.trending_up,
                            title: 'Occupation',
                            value: '${_formatNumber(_stats!['taux_occupation'] ?? 0)}%',
                            color: Colors.purple,
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),
                      // Prochaines réservations
                      if (_stats!['prochaines_reservations'] != null &&
                          (_stats!['prochaines_reservations'] as List).isNotEmpty)
                        Card(
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Prochaines réservations',
                                  style: Theme.of(context)
                                      .textTheme
                                      .titleLarge
                                      ?.copyWith(
                                        fontWeight: FontWeight.bold,
                                      ),
                                ),
                                const SizedBox(height: 16),
                                ...((_stats!['prochaines_reservations'] as List)
                                    .map((reservation) => ListTile(
                                          leading: const Icon(Icons.calendar_today),
                                          title: Text(
                                            reservation['terrain_nom'] ?? '',
                                            style: const TextStyle(
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                          subtitle: Text(
                                            reservation['client_nom'] ?? '',
                                          ),
                                          trailing: Text(
                                            _formatDate(
                                              reservation['date_debut'] ?? '',
                                            ),
                                            style: TextStyle(
                                              color: Theme.of(context)
                                                  .colorScheme
                                                  .primary,
                                            ),
                                          ),
                                        ))
                                    .toList()),
                              ],
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

  String _formatDate(String dateString) {
    try {
      final date = DateTime.parse(dateString);
      return '${date.day}/${date.month} ${date.hour}:${date.minute.toString().padLeft(2, '0')}';
    } catch (e) {
      return dateString;
    }
  }
}

class _StatCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String value;
  final String? subtitle;
  final Color color;

  const _StatCard({
    required this.icon,
    required this.title,
    required this.value,
    this.subtitle,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(8),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Icon(icon, color: color, size: 16),
            ),
            const SizedBox(height: 6),
            Text(
              value,
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: color,
                    fontSize: 16,
                  ),
              overflow: TextOverflow.ellipsis,
              maxLines: 1,
            ),
            const SizedBox(height: 2),
            Text(
              title,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Colors.grey[600],
                    fontSize: 10,
                  ),
              overflow: TextOverflow.ellipsis,
              maxLines: 1,
            ),
            if (subtitle != null)
              Padding(
                padding: const EdgeInsets.only(top: 1),
                child: Text(
                  subtitle!,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Colors.grey[500],
                        fontSize: 8,
                      ),
                  overflow: TextOverflow.ellipsis,
                  maxLines: 1,
                ),
              ),
          ],
        ),
      ),
    );
  }
}

