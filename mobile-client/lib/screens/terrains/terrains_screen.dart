import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/terrain_provider.dart';
import 'terrain_detail_screen.dart';
import 'package:geolocator/geolocator.dart';

class TerrainsScreen extends StatefulWidget {
  const TerrainsScreen({super.key});

  @override
  State<TerrainsScreen> createState() => _TerrainsScreenState();
}

class _TerrainsScreenState extends State<TerrainsScreen> {
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<TerrainProvider>(context, listen: false).fetchTerrains();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _searchNearby() async {
    try {
      final position = await Geolocator.getCurrentPosition();
      await Provider.of<TerrainProvider>(context, listen: false)
          .fetchNearbyTerrains(position.latitude, position.longitude, 10);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erreur de géolocalisation: ${e.toString()}'),
          ),
        );
      }
    }
  }

  void _performSearch() {
    final query = _searchController.text.trim();
    Provider.of<TerrainProvider>(context, listen: false).fetchTerrains(
      search: query.isEmpty ? null : query,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Terrains'),
        actions: [
          IconButton(
            icon: const Icon(Icons.my_location),
            onPressed: _searchNearby,
            tooltip: 'Terrains à proximité',
          ),
        ],
      ),
      body: Column(
        children: [
          // Search Bar
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _searchController,
                    decoration: InputDecoration(
                      hintText: 'Rechercher un terrain...',
                      prefixIcon: const Icon(Icons.search),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      suffixIcon: _searchController.text.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.clear),
                              onPressed: () {
                                _searchController.clear();
                                _performSearch();
                              },
                            )
                          : null,
                    ),
                    onSubmitted: (_) => _performSearch(),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  icon: const Icon(Icons.search),
                  onPressed: _performSearch,
                  style: IconButton.styleFrom(
                    backgroundColor: Theme.of(context).colorScheme.primary,
                    foregroundColor: Colors.white,
                  ),
                ),
              ],
            ),
          ),
          // Terrains List
          Expanded(
            child: Consumer<TerrainProvider>(
              builder: (context, provider, _) {
                if (provider.isLoading) {
                  return const Center(child: CircularProgressIndicator());
                }

                if (provider.terrains.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.sports_soccer_outlined,
                          size: 80,
                          color: Colors.grey[400],
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'Aucun terrain trouvé',
                          style: Theme.of(context).textTheme.titleLarge,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Essayez de modifier vos critères de recherche',
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                color: Colors.grey[600],
                              ),
                        ),
                      ],
                    ),
                  );
                }

                return RefreshIndicator(
                  onRefresh: () => provider.fetchTerrains(),
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: provider.terrains.length,
                    itemBuilder: (context, index) {
                      final terrain = provider.terrains[index];
                      return _TerrainCard(terrain: terrain);
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _TerrainCard extends StatelessWidget {
  final Map<String, dynamic> terrain;

  const _TerrainCard({required this.terrain});

  @override
  Widget build(BuildContext context) {
    final prix = terrain['prix_heure'] ?? 0;
    final note = terrain['note_moyenne'] ?? 0.0;
    final nombreAvis = terrain['nombre_avis'] ?? 0;

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () {
          Navigator.of(context).push(
            MaterialPageRoute(
              builder: (_) => TerrainDetailScreen(terrainId: terrain['id']),
            ),
          );
        },
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image
            Container(
              height: 200,
              width: double.infinity,
              color: Colors.grey[300],
              child: terrain['image_principale'] != null
                  ? Image.network(
                      terrain['image_principale'],
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => const Icon(
                        Icons.sports_soccer,
                        size: 60,
                        color: Colors.grey,
                      ),
                    )
                  : const Icon(
                      Icons.sports_soccer,
                      size: 60,
                      color: Colors.grey,
                    ),
            ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          terrain['nom'] ?? 'Terrain',
                          style: Theme.of(context)
                              .textTheme
                              .titleLarge
                              ?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: Theme.of(context)
                              .colorScheme
                              .primary
                              .withOpacity(0.1),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          '${prix.toString().replaceAllMapped(
                            RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
                            (Match m) => '${m[1]},',
                          )} CFA/h',
                          style: TextStyle(
                            color: Theme.of(context).colorScheme.primary,
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Icon(Icons.location_on, size: 16, color: Colors.grey[600]),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          terrain['adresse'] ?? '',
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                color: Colors.grey[600],
                              ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      _InfoChip(
                        icon: Icons.people,
                        label: '${terrain['capacite'] ?? 0} pers.',
                      ),
                      const SizedBox(width: 12),
                      _InfoChip(
                        icon: Icons.square_foot,
                        label: '${terrain['surface'] ?? 0} m²',
                      ),
                      const Spacer(),
                      if (note > 0)
                        Row(
                          children: [
                            const Icon(Icons.star, color: Colors.amber, size: 16),
                            const SizedBox(width: 4),
                            Text(
                              note.toStringAsFixed(1),
                              style: const TextStyle(fontWeight: FontWeight.bold),
                            ),
                            if (nombreAvis > 0)
                              Text(
                                ' ($nombreAvis)',
                                style: TextStyle(color: Colors.grey[600]),
                              ),
                          ],
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _InfoChip extends StatelessWidget {
  final IconData icon;
  final String label;

  const _InfoChip({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 16, color: Colors.grey[600]),
        const SizedBox(width: 4),
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: Colors.grey[600],
              ),
        ),
      ],
    );
  }
}

