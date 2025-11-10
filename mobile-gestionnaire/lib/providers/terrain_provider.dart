import 'package:flutter/foundation.dart';
import '../services/api_service.dart';

class TerrainProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  List<dynamic> _terrains = [];
  bool _isLoading = false;
  
  List<dynamic> get terrains => _terrains;
  bool get isLoading => _isLoading;
  
  Future<void> fetchTerrains() async {
    try {
      _isLoading = true;
      notifyListeners();
      
      final response = await _apiService.getManagerTerrains();
      
      if (response['success'] == true) {
        _terrains = response['data'] ?? [];
      }
      
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      rethrow;
    }
  }
  
  Future<void> updatePrix(int terrainId, double nouveauPrix) async {
    try {
      final response = await _apiService.updateTerrainPrix(terrainId, nouveauPrix);
      
      if (response['success'] == true) {
        await fetchTerrains();
      }
    } catch (e) {
      rethrow;
    }
  }
  
  Future<void> toggleDisponibilite(int terrainId) async {
    try {
      final response = await _apiService.toggleTerrainDisponibilite(terrainId);
      
      if (response['success'] == true) {
        await fetchTerrains();
      }
    } catch (e) {
      rethrow;
    }
  }
}

