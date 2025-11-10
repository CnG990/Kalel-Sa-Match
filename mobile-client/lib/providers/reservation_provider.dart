import 'package:flutter/foundation.dart';
import '../services/api_service.dart';

class ReservationProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  List<dynamic> _reservations = [];
  bool _isLoading = false;
  
  List<dynamic> get reservations => _reservations;
  bool get isLoading => _isLoading;
  
  Future<void> fetchMyReservations() async {
    try {
      _isLoading = true;
      notifyListeners();
      
      final response = await _apiService.getMyReservations();
      
      if (response['success'] == true) {
        _reservations = response['data'] ?? [];
      }
      
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      rethrow;
    }
  }
  
  Future<bool> createReservation(Map<String, dynamic> data) async {
    try {
      final response = await _apiService.createReservation(data);
      
      if (response['success'] == true) {
        await fetchMyReservations();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }
  
  Future<Map<String, dynamic>?> checkAvailability(
    int terrainId,
    String date,
    int duree,
  ) async {
    try {
      final response = await _apiService.checkAvailability(terrainId, date, duree);
      if (response['success'] == true) {
        return response['data'];
      }
      return null;
    } catch (e) {
      return null;
    }
  }
}

