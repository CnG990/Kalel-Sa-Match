import 'package:flutter/foundation.dart';
import '../services/api_service.dart';

class TerrainProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  ApiService get apiService => _apiService;
  
  List<dynamic> _terrains = [];
  bool _isLoading = false;
  int _currentPage = 1;
  int _totalPages = 1;
  String? _searchQuery;
  
  List<dynamic> get terrains => _terrains;
  bool get isLoading => _isLoading;
  int get currentPage => _currentPage;
  int get totalPages => _totalPages;
  
  Future<void> fetchTerrains({
    int page = 1,
    String? search,
    String? sortBy,
    String? sortDirection,
    int perPage = 20,
  }) async {
    try {
      _isLoading = true;
      _searchQuery = search;
      notifyListeners();
      
      final response = await _apiService.getTerrains(
        page: page,
        perPage: perPage,
        search: search,
        sortBy: sortBy,
        sortDirection: sortDirection,
      );
      
      if (response['success'] == true && response['data'] != null) {
        final data = response['data'];
        if (page == 1) {
          _terrains = data['data'] ?? [];
        } else {
          _terrains.addAll(data['data'] ?? []);
        }
        _currentPage = data['current_page'] ?? 1;
        _totalPages = data['last_page'] ?? 1;
      }
      
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      rethrow;
    }
  }

  /// Charge tous les terrains en récupérant toutes les pages
  Future<void> fetchAllTerrains({
    String? search,
    String? sortBy,
    String? sortDirection,
  }) async {
    try {
      _isLoading = true;
      _searchQuery = search;
      notifyListeners();
      
      // Charger la première page pour obtenir le nombre total de pages
      final firstResponse = await _apiService.getTerrains(
        page: 1,
        perPage: 200, // Augmenter pour charger tous les terrains en une seule requête
        search: search,
        sortBy: sortBy,
        sortDirection: sortDirection,
      );
      
      if (firstResponse['success'] == true && firstResponse['data'] != null) {
        final firstData = firstResponse['data'];
        _terrains = List.from(firstData['data'] ?? []);
        _currentPage = firstData['current_page'] ?? 1;
        _totalPages = firstData['last_page'] ?? 1;
        
        // Debug: Afficher le nombre de terrains chargés
        debugPrint('📊 Terrains chargés: ${_terrains.length} sur ${firstData['total'] ?? 'N/A'}');
        
        // Charger les pages restantes si nécessaire
        if (_totalPages > 1) {
          for (int page = 2; page <= _totalPages; page++) {
            final response = await _apiService.getTerrains(
              page: page,
              perPage: 200,
              search: search,
              sortBy: sortBy,
              sortDirection: sortDirection,
            );
            
            if (response['success'] == true && response['data'] != null) {
              final data = response['data'];
              final newTerrains = data['data'] ?? [];
              _terrains.addAll(newTerrains);
              debugPrint('📊 Page $page: ${newTerrains.length} terrains ajoutés. Total: ${_terrains.length}');
            }
          }
        }
        
        // Debug: Vérifier les terrains de Mbour
        final mbourTerrains = _terrains.where((t) {
          final nom = (t['nom'] as String? ?? '').toLowerCase();
          return nom.contains('foot7') || 
                 nom.contains('mini-foot') || 
                 nom.contains('rara');
        }).toList();
        debugPrint('🏖️  Terrains de Mbour trouvés: ${mbourTerrains.length}');
        for (var terrain in mbourTerrains) {
          debugPrint('   - ${terrain['nom']}: Lat=${terrain['latitude']}, Lon=${terrain['longitude']}');
        }
      }
      
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      debugPrint('❌ Erreur lors du chargement des terrains: $e');
      rethrow;
    }
  }
  
  Future<void> fetchNearbyTerrains(
    double latitude,
    double longitude,
    double radius,
  ) async {
    try {
      _isLoading = true;
      notifyListeners();
      
      final response = await _apiService.getNearbyTerrains(
        latitude,
        longitude,
        radius,
      );
      
      if (response['success'] == true) {
        _terrains = response['data'] ?? [];
        _currentPage = 1;
        _totalPages = 1;
      }
      
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      rethrow;
    }
  }
  
  Future<Map<String, dynamic>?> getTerrain(int id) async {
    try {
      final response = await _apiService.getTerrain(id);
      if (response['success'] == true) {
        return response['data'];
      }
      return null;
    } catch (e) {
      return null;
    }
  }
  
  void clearTerrains() {
    _terrains = [];
    _currentPage = 1;
    _totalPages = 1;
    notifyListeners();
  }
}

