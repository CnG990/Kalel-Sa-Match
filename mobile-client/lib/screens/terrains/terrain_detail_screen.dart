import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/terrain_provider.dart';
import '../../providers/reservation_provider.dart';
import '../../widgets/ksm_logo_icon.dart';
import 'reservation_screen.dart';
import 'subscriptions_screen.dart';
import '../reviews/reviews_list_screen.dart';

class TerrainDetailScreen extends StatefulWidget {
  final int terrainId;

  const TerrainDetailScreen({super.key, required this.terrainId});

  @override
  State<TerrainDetailScreen> createState() => _TerrainDetailScreenState();
}

class _TerrainDetailScreenState extends State<TerrainDetailScreen> {
  Map<String, dynamic>? _terrain;
  bool _isLoading = true;
  bool _isFavorite = false;
  bool _isCheckingFavorite = true;

  @override
  void initState() {
    super.initState();
    _loadTerrain();
  }

  Future<void> _loadTerrain() async {
    try {
      final provider = Provider.of<TerrainProvider>(context, listen: false);
      final terrain = await provider.getTerrain(widget.terrainId);
      setState(() {
        _terrain = terrain;
        _isLoading = false;
      });
      _checkFavorite();
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erreur: ${e.toString()}')),
        );
      }
    }
  }

  Future<void> _checkFavorite() async {
    try {
      final apiService = Provider.of<TerrainProvider>(context, listen: false).apiService;
      final response = await apiService.checkFavorite(widget.terrainId);
      
      if (mounted) {
        setState(() {
          _isFavorite = response['success'] == true && (response['data']?['is_favorite'] == true);
          _isCheckingFavorite = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isCheckingFavorite = false;
        });
      }
    }
  }

  Future<void> _toggleFavorite() async {
    try {
      final apiService = Provider.of<TerrainProvider>(context, listen: false).apiService;
      
      if (_isFavorite) {
        final response = await apiService.removeFavorite(widget.terrainId);
        if (mounted && response['success'] == true) {
          setState(() {
            _isFavorite = false;
          });
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Favori retiré'),
              backgroundColor: Colors.orange,
            ),
          );
        }
      } else {
        final response = await apiService.addFavorite(widget.terrainId);
        if (mounted && response['success'] == true) {
          setState(() {
            _isFavorite = true;
          });
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Ajouté aux favoris'),
              backgroundColor: Colors.green,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
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
    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Détails du terrain'),
          actions: [
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: KsmLogoIcon(size: 24, color: Colors.white),
            ),
          ],
        ),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (_terrain == null) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Détails du terrain'),
          actions: [
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: KsmLogoIcon(size: 24, color: Colors.white),
            ),
          ],
        ),
        body: const Center(child: Text('Terrain non trouvé')),
      );
    }

    final terrain = _terrain!;
    // Convertir les valeurs en nombres pour éviter les erreurs de type
    final prix = _toDouble(terrain['prix_heure']) ?? 0.0;
    final note = _toDouble(terrain['note_moyenne']) ?? 0.0;
    final nombreAvis = _toInt(terrain['nombre_avis']) ?? 0;

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 100,
            pinned: true,
            actions: [
              IconButton(
                icon: Icon(
                  _isFavorite ? Icons.favorite : Icons.favorite_border,
                  color: _isFavorite ? Colors.red : Colors.white,
                ),
                onPressed: _isCheckingFavorite ? null : _toggleFavorite,
                tooltip: _isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris',
              ),
              Padding(
                padding: const EdgeInsets.all(8.0),
                child: KsmLogoIcon(size: 24, color: Colors.white),
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              title: Text(terrain['nom'] ?? 'Terrain'),
              background: Container(
                color: Theme.of(context).colorScheme.primaryContainer,
                child: Center(
                  child: Icon(
                    Icons.sports_soccer,
                    size: 40,
                    color: Theme.of(context).colorScheme.primary,
                  ),
                ),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Prix et note
                  Row(
                    children: [
                      Expanded(
                        child: Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Theme.of(context)
                                .colorScheme
                                .primaryContainer,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Column(
                            children: [
                              Text(
                                '${prix.toInt().toString().replaceAllMapped(
                                  RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
                                  (Match m) => '${m[1]},',
                                )} CFA',
                                style: Theme.of(context)
                                    .textTheme
                                    .headlineSmall
                                    ?.copyWith(
                                      fontWeight: FontWeight.bold,
                                      color: Theme.of(context).colorScheme.primary,
                                    ),
                              ),
                              Text(
                                'par heure',
                                style: Theme.of(context).textTheme.bodySmall,
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      if (note > 0)
                        GestureDetector(
                          onTap: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (_) => ReviewsListScreen(terrainId: widget.terrainId),
                              ),
                            );
                          },
                          child: Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: Colors.amber.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Column(
                              children: [
                                Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    const Icon(Icons.star, color: Colors.amber),
                                    const SizedBox(width: 4),
                                    Text(
                                      note.toStringAsFixed(1),
                                      style: Theme.of(context)
                                          .textTheme
                                          .headlineSmall
                                          ?.copyWith(
                                            fontWeight: FontWeight.bold,
                                          ),
                                    ),
                                  ],
                                ),
                                Text(
                                  '$nombreAvis avis',
                                  style: Theme.of(context).textTheme.bodySmall,
                                ),
                              ],
                            ),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  // Adresse
                  Row(
                    children: [
                      Icon(Icons.location_on,
                          color: Theme.of(context).colorScheme.primary),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          terrain['adresse'] ?? '',
                          style: Theme.of(context).textTheme.bodyLarge,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  // Description
                  if (terrain['description'] != null) ...[
                    Text(
                      'Description',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      terrain['description'],
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                    const SizedBox(height: 24),
                  ],
                  // Infos
                  Text(
                    'Informations',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const SizedBox(height: 16),
                  _InfoRow('Capacité', '${_toInt(terrain['capacite']) ?? 0} personnes'),
                  _InfoRow('Surface', _formatSurface(terrain['surface'])),
                  const SizedBox(height: 24),
                  // Bouton réserver
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => ReservationScreen(terrain: terrain),
                          ),
                        );
                      },
                      icon: const Icon(Icons.calendar_today),
                      label: const Text('Réserver maintenant'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Theme.of(context).colorScheme.primary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  // Bouton Abonnement
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => SubscriptionsScreen(terrainId: widget.terrainId),
                          ),
                        );
                      },
                      icon: const Icon(Icons.card_membership),
                      label: const Text('Abonnement'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Theme.of(context).colorScheme.primary,
                        side: BorderSide(
                          color: Theme.of(context).colorScheme.primary,
                          width: 2,
                        ),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _InfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color: Colors.grey[700],
            ),
          ),
          Text(value),
        ],
      ),
    );
  }

  // Fonction helper pour convertir en double
  double? _toDouble(dynamic value) {
    if (value == null) return null;
    if (value is double) return value;
    if (value is int) return value.toDouble();
    if (value is String) {
      return double.tryParse(value);
    }
    return null;
  }

  // Fonction helper pour convertir en int
  int? _toInt(dynamic value) {
    if (value == null) return null;
    if (value is int) return value;
    if (value is double) return value.toInt();
    if (value is String) {
      return int.tryParse(value);
    }
    return null;
  }

  // Fonction helper pour formater la surface
  String _formatSurface(dynamic surface) {
    final surfaceValue = _toDouble(surface);
    if (surfaceValue == null || surfaceValue <= 0) {
      return '0 m²';
    }
    return '${surfaceValue.toStringAsFixed(0)} m²';
  }
}

