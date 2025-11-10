import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:provider/provider.dart';
import 'package:geolocator/geolocator.dart';
import '../../providers/terrain_provider.dart';
import '../../widgets/ksm_logo_icon.dart';
import 'terrain_detail_screen.dart';
import 'package:flutter/foundation.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  final MapController _mapController = MapController();
  final TextEditingController _searchController = TextEditingController();
  Position? _userPosition;
  bool _isLoadingLocation = true;
  List<Marker> _markers = [];
  Map<int, Map<String, dynamic>> _terrainsMap = {};
  List<Map<String, dynamic>> _searchResults = [];
  bool _isSearching = false;
  bool _showSearchResults = false;
  bool _isSearchBarVisible = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _getUserLocation();
      _loadTerrains();
    });
    
    // Écouter les changements du provider pour mettre à jour les marqueurs
    final provider = Provider.of<TerrainProvider>(context, listen: false);
    provider.addListener(_onTerrainsChanged);
  }

  void _onTerrainsChanged() {
    if (mounted) {
      _updateMarkers();
    }
  }

  @override
  void dispose() {
    final provider = Provider.of<TerrainProvider>(context, listen: false);
    provider.removeListener(_onTerrainsChanged);
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _getUserLocation() async {
    try {
      // Vérifier les permissions
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Les services de localisation sont désactivés'),
            ),
          );
        }
        setState(() {
          _isLoadingLocation = false;
          // Position par défaut sur Dakar
          _userPosition = Position(
            latitude: 14.6928,
            longitude: -17.4441,
            timestamp: DateTime.now(),
            accuracy: 0,
            altitude: 0,
            heading: 0,
            speed: 0,
            speedAccuracy: 0,
            altitudeAccuracy: 0,
            headingAccuracy: 0,
          );
        });
        _centerOnUserLocation();
        return;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Permission de localisation refusée'),
              ),
            );
          }
          setState(() {
            _isLoadingLocation = false;
            // Position par défaut sur Dakar
            _userPosition = Position(
              latitude: 14.6928,
              longitude: -17.4441,
              timestamp: DateTime.now(),
              accuracy: 0,
              altitude: 0,
              heading: 0,
              speed: 0,
              speedAccuracy: 0,
              altitudeAccuracy: 0,
              headingAccuracy: 0,
            );
          });
          _centerOnUserLocation();
          return;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Permission de localisation définitivement refusée'),
            ),
          );
        }
        setState(() {
          _isLoadingLocation = false;
          // Position par défaut sur Dakar
          _userPosition = Position(
            latitude: 14.6928,
            longitude: -17.4441,
            timestamp: DateTime.now(),
            accuracy: 0,
            altitude: 0,
            heading: 0,
            speed: 0,
            speedAccuracy: 0,
            altitudeAccuracy: 0,
            headingAccuracy: 0,
          );
        });
        _centerOnUserLocation();
        return;
      }

      // Obtenir la position actuelle
      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      if (mounted) {
        setState(() {
          _userPosition = position;
          _isLoadingLocation = false;
        });

        // Centrer la carte sur la position de l'utilisateur
        _centerOnUserLocation();
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoadingLocation = false;
          // Position par défaut sur Dakar
          _userPosition = Position(
            latitude: 14.6928,
            longitude: -17.4441,
            timestamp: DateTime.now(),
            accuracy: 0,
            altitude: 0,
            heading: 0,
            speed: 0,
            speedAccuracy: 0,
            altitudeAccuracy: 0,
            headingAccuracy: 0,
          );
        });
        _centerOnUserLocation();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erreur de géolocalisation: ${e.toString()}'),
          ),
        );
      }
    }
  }

  Future<void> _loadTerrains() async {
    final provider = Provider.of<TerrainProvider>(context, listen: false);
    // Charger tous les terrains (toutes les pages)
    await provider.fetchAllTerrains();
    if (mounted) {
      _updateMarkers();
    }
  }

  Future<void> _searchTerrains(String query) async {
    if (query.isEmpty) {
      setState(() {
        _searchResults = [];
        _showSearchResults = false;
        _isSearching = false;
      });
      _loadTerrains();
      return;
    }

    setState(() {
      _isSearching = true;
      _showSearchResults = true;
    });

    try {
      final provider = Provider.of<TerrainProvider>(context, listen: false);
      final response = await provider.apiService.getTerrains(
        search: query,
        perPage: 50,
      );

      if (mounted) {
        if (response['success'] == true) {
          final data = response['data'];
          final terrains = data is Map && data['data'] != null 
              ? List<Map<String, dynamic>>.from(data['data'])
              : List<Map<String, dynamic>>.from(data ?? []);

          setState(() {
            _searchResults = terrains;
            _isSearching = false;
          });

          // Filtrer les marqueurs pour n'afficher que les résultats de recherche
          _updateMarkersWithSearch(terrains);
        } else {
          setState(() {
            _searchResults = [];
            _isSearching = false;
          });
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isSearching = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erreur de recherche: ${e.toString()}'),
          ),
        );
      }
    }
  }

  void _updateMarkersWithSearch(List<Map<String, dynamic>> terrains) {
    final List<Marker> markers = [];
    _terrainsMap.clear();

    // Marqueur pour la position de l'utilisateur
    if (_userPosition != null) {
      markers.add(
        Marker(
          point: LatLng(_userPosition!.latitude, _userPosition!.longitude),
          width: 40,
          height: 40,
          child: Container(
            decoration: BoxDecoration(
              color: Colors.blue,
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white, width: 3),
              boxShadow: [
                BoxShadow(
                  color: Colors.blue.withOpacity(0.5),
                  blurRadius: 10,
                  spreadRadius: 2,
                ),
              ],
            ),
            child: const Icon(
              Icons.my_location,
              color: Colors.white,
              size: 20,
            ),
          ),
        ),
      );
    }

    // Marqueurs pour les terrains de recherche
    for (var terrain in terrains) {
      final id = terrain['id'] as int;
      final latitude = terrain['latitude'] as double?;
      final longitude = terrain['longitude'] as double?;
      final nom = terrain['nom'] as String? ?? 'Terrain';

      if (latitude != null && longitude != null && latitude != 0 && longitude != 0) {
        _terrainsMap[id] = terrain;

        markers.add(
          Marker(
            point: LatLng(latitude, longitude),
            width: 50,
            height: 50,
            child: Builder(
              builder: (context) => GestureDetector(
                onTap: () {
                  _showTerrainInfo(terrain);
                  // Centrer la carte sur le terrain sélectionné
                  _mapController.move(LatLng(latitude, longitude), 15.0);
                },
                child: Container(
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.primary,
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white, width: 2),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.3),
                        blurRadius: 5,
                        spreadRadius: 1,
                      ),
                    ],
                  ),
                  child: const Icon(
                    Icons.sports_soccer,
                    color: Colors.white,
                    size: 24,
                  ),
                ),
              ),
            ),
          ),
        );
      }
    }

    if (mounted) {
      setState(() {
        _markers = markers;
      });
    }
  }

  void _onSearchResultTap(Map<String, dynamic> terrain) {
    final latitude = terrain['latitude'] as double?;
    final longitude = terrain['longitude'] as double?;

    if (latitude != null && longitude != null && latitude != 0 && longitude != 0) {
      // Centrer la carte sur le terrain
      _mapController.move(LatLng(latitude, longitude), 15.0);
      
      // Afficher les informations du terrain
      _showTerrainInfo(terrain);
      
      // Masquer les résultats de recherche
      setState(() {
        _showSearchResults = false;
        _searchController.clear();
      });
    }
  }

  void _updateMarkers() {
    final provider = Provider.of<TerrainProvider>(context, listen: false);
    final List<Marker> markers = [];
    _terrainsMap.clear();

    // Debug: Afficher le nombre total de terrains
    debugPrint('🗺️  Mise à jour des marqueurs: ${provider.terrains.length} terrains');

    // Marqueur pour la position de l'utilisateur
    if (_userPosition != null) {
      markers.add(
        Marker(
          point: LatLng(_userPosition!.latitude, _userPosition!.longitude),
          width: 40,
          height: 40,
          child: Container(
            decoration: BoxDecoration(
              color: Colors.blue,
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white, width: 3),
              boxShadow: [
                BoxShadow(
                  color: Colors.blue.withOpacity(0.5),
                  blurRadius: 10,
                  spreadRadius: 2,
                ),
              ],
            ),
            child: const Icon(
              Icons.my_location,
              color: Colors.white,
              size: 20,
            ),
          ),
        ),
      );
    }

    // Marqueurs pour les terrains
    int validTerrains = 0;
    int invalidTerrains = 0;
    
    for (var terrain in provider.terrains) {
      final id = terrain['id'] as int;
      final latitude = terrain['latitude'] as double?;
      final longitude = terrain['longitude'] as double?;
      final nom = terrain['nom'] as String? ?? 'Terrain';
      final adresse = terrain['adresse'] as String? ?? '';
      final prix = terrain['prix_heure'] as int? ?? 0;

      if (latitude != null && longitude != null && latitude != 0 && longitude != 0) {
        _terrainsMap[id] = terrain;
        validTerrains++;

        markers.add(
          Marker(
            point: LatLng(latitude, longitude),
            width: 50,
            height: 50,
            child: Builder(
              builder: (context) => GestureDetector(
                onTap: () => _showTerrainInfo(terrain),
                child: Container(
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.primary,
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white, width: 2),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.3),
                        blurRadius: 5,
                        spreadRadius: 1,
                      ),
                    ],
                  ),
                  child: const Icon(
                    Icons.sports_soccer,
                    color: Colors.white,
                    size: 24,
                  ),
                ),
              ),
            ),
          ),
        );
      } else {
        invalidTerrains++;
        debugPrint('⚠️  Terrain "$nom" (ID: $id) a des coordonnées invalides: Lat=$latitude, Lon=$longitude');
      }
    }

    debugPrint('✅ Marqueurs créés: $validTerrains valides, $invalidTerrains invalides');

    if (mounted) {
      setState(() {
        _markers = markers;
      });
    }
  }

  void _showTerrainInfo(Map<String, dynamic> terrain) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.5,
        minChildSize: 0.3,
        maxChildSize: 0.9,
        expand: false,
        builder: (context, scrollController) => SingleChildScrollView(
          controller: scrollController,
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: Colors.grey[300],
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  terrain['nom'] ?? 'Terrain',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
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
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: _InfoCard(
                        icon: Icons.attach_money,
                        label: 'Prix/heure',
                        value: '${terrain['prix_heure'] ?? 0} FCFA',
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: _InfoCard(
                        icon: Icons.people,
                        label: 'Capacité',
                        value: '${terrain['capacite'] ?? 0} pers.',
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: _InfoCard(
                        icon: Icons.square_foot,
                        label: 'Surface',
                        value: _formatSurface(terrain['surface']),
                      ),
                    ),
                    const SizedBox(width: 8),
                    if (terrain['note_moyenne'] != null)
                      Expanded(
                        child: _InfoCard(
                          icon: Icons.star,
                          label: 'Note',
                          value: '${terrain['note_moyenne']}',
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.pop(context);
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => TerrainDetailScreen(
                            terrainId: terrain['id'],
                          ),
                        ),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Theme.of(context).colorScheme.primary,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: const Text(
                      'Voir les détails et réserver',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _centerOnUserLocation() {
    if (_userPosition != null) {
      _mapController.move(
        LatLng(_userPosition!.latitude, _userPosition!.longitude),
        13.0,
      );
    }
  }

  void _zoomIn() {
    final currentZoom = _mapController.camera.zoom;
    final newZoom = (currentZoom + 1).clamp(5.0, 18.0);
    _mapController.move(_mapController.camera.center, newZoom);
  }

  void _zoomOut() {
    final currentZoom = _mapController.camera.zoom;
    final newZoom = (currentZoom - 1).clamp(5.0, 18.0);
    _mapController.move(_mapController.camera.center, newZoom);
  }

  String _formatSurface(dynamic surface) {
    if (surface == null) return '0 m²';
    if (surface is num) {
      final surfaceValue = surface.toDouble();
      if (surfaceValue > 0) {
        return '${surfaceValue.toStringAsFixed(0)} m²';
      }
    } else if (surface is String) {
      final surfaceValue = double.tryParse(surface);
      if (surfaceValue != null && surfaceValue > 0) {
        return '${surfaceValue.toStringAsFixed(0)} m²';
      }
    }
    return '0 m²';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Carte des Terrains'),
        actions: [
          IconButton(
            icon: Icon(_isSearchBarVisible ? Icons.close : Icons.search),
            onPressed: () {
              setState(() {
                _isSearchBarVisible = !_isSearchBarVisible;
                if (!_isSearchBarVisible) {
                  _searchController.clear();
                  _showSearchResults = false;
                  _searchResults = [];
                  _searchTerrains('');
                }
              });
            },
            tooltip: _isSearchBarVisible ? 'Fermer la recherche' : 'Rechercher',
          ),
          IconButton(
            icon: const Icon(Icons.my_location),
            onPressed: _centerOnUserLocation,
            tooltip: 'Centrer sur ma position',
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              _loadTerrains();
              _getUserLocation();
            },
            tooltip: 'Actualiser',
          ),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: KsmLogoIcon(size: 24, color: Colors.white),
          ),
        ],
      ),
      body: Stack(
        children: [
          // Carte OpenStreetMap
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: LatLng(
                _userPosition?.latitude ?? 14.6928,
                _userPosition?.longitude ?? -17.4441,
              ),
              initialZoom: _userPosition != null ? 13.0 : 11.0,
              minZoom: 5.0,
              maxZoom: 18.0,
            ),
            children: [
              // Couche de tuiles OpenStreetMap
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'com.example.terrains_client',
                maxZoom: 19,
              ),
              // Marqueurs
              MarkerLayer(
                markers: _markers,
              ),
            ],
          ),
          // Indicateur de chargement
          if (_isLoadingLocation)
            Container(
              color: Colors.black.withOpacity(0.3),
              child: const Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    CircularProgressIndicator(),
                    SizedBox(height: 16),
                    Text(
                      'Obtention de votre position...',
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
          // Barre de recherche
          if (_isSearchBarVisible)
            Positioned(
              top: 16,
              left: 16,
              right: 16,
              child: Column(
                children: [
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.2),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: ValueListenableBuilder<TextEditingValue>(
                      valueListenable: _searchController,
                      builder: (context, value, child) {
                        return TextField(
                          controller: _searchController,
                          autofocus: true,
                          decoration: InputDecoration(
                            hintText: 'Rechercher un terrain...',
                            prefixIcon: const Icon(Icons.search, color: Colors.blue),
                            suffixIcon: value.text.isNotEmpty
                                ? IconButton(
                                    icon: const Icon(Icons.clear),
                                    onPressed: () {
                                      _searchController.clear();
                                      setState(() {
                                        _showSearchResults = false;
                                        _searchResults = [];
                                      });
                                      _searchTerrains('');
                                    },
                                  )
                                : null,
                            border: InputBorder.none,
                            contentPadding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 12,
                            ),
                          ),
                          onChanged: (value) {
                            if (value.length >= 2) {
                              _searchTerrains(value);
                            } else if (value.isEmpty) {
                              setState(() {
                                _showSearchResults = false;
                                _searchResults = [];
                              });
                              _searchTerrains('');
                            }
                          },
                          onSubmitted: (value) {
                            if (value.length >= 2) {
                              _searchTerrains(value);
                            }
                          },
                        );
                      },
                    ),
                  ),
                // Résultats de recherche
                if (_showSearchResults && _searchResults.isNotEmpty)
                  Container(
                    margin: const EdgeInsets.only(top: 8),
                    constraints: const BoxConstraints(maxHeight: 200),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.2),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: _isSearching
                        ? const Padding(
                            padding: EdgeInsets.all(16.0),
                            child: Center(child: CircularProgressIndicator()),
                          )
                        : ListView.builder(
                            shrinkWrap: true,
                            itemCount: _searchResults.length,
                            itemBuilder: (context, index) {
                              final terrain = _searchResults[index];
                              return ListTile(
                                leading: const Icon(Icons.sports_soccer),
                                title: Text(terrain['nom'] ?? 'Terrain'),
                                subtitle: Text(
                                  terrain['adresse'] ?? '',
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                trailing: Text(
                                  '${terrain['prix_heure'] ?? 0} FCFA/h',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: Theme.of(context).colorScheme.primary,
                                  ),
                                ),
                                onTap: () => _onSearchResultTap(terrain),
                              );
                            },
                          ),
                  ),
              ],
            ),
          ),
          // Compteur de terrains
          Positioned(
            top: _isSearchBarVisible 
                ? (_showSearchResults && _searchResults.isNotEmpty ? 240 : 80)
                : 80,
            left: 16,
            child: Consumer<TerrainProvider>(
              builder: (context, provider, _) {
                return Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.2),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      KsmLogoIcon(
                        size: 20,
                        color: Theme.of(context).colorScheme.primary,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        '${provider.terrains.length} terrain${provider.terrains.length > 1 ? 's' : ''}',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: Theme.of(context).colorScheme.primary,
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
          // Contrôles de zoom
          Positioned(
            right: 16,
            bottom: 100,
            child: Column(
              children: [
                // Bouton zoom in
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(8),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.2),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Material(
                    color: Colors.transparent,
                    child: InkWell(
                      onTap: _zoomIn,
                      borderRadius: BorderRadius.circular(8),
                      child: Container(
                        width: 48,
                        height: 48,
                        alignment: Alignment.center,
                        child: const Icon(
                          Icons.add,
                          color: Colors.black87,
                          size: 24,
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 2),
                // Bouton zoom out
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(8),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.2),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Material(
                    color: Colors.transparent,
                    child: InkWell(
                      onTap: _zoomOut,
                      borderRadius: BorderRadius.circular(8),
                      child: Container(
                        width: 48,
                        height: 48,
                        alignment: Alignment.center,
                        child: const Icon(
                          Icons.remove,
                          color: Colors.black87,
                          size: 24,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _InfoCard({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.primaryContainer.withOpacity(0.3),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: Theme.of(context).colorScheme.primary.withOpacity(0.2),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 16, color: Theme.of(context).colorScheme.primary),
              const SizedBox(width: 4),
              Text(
                label,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Colors.grey[600],
                    ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: Theme.of(context).colorScheme.primary,
                ),
          ),
        ],
      ),
    );
  }
}
