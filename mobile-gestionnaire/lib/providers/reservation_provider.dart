import 'package:flutter/foundation.dart';
import '../services/api_service.dart';

class ReservationProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  List<dynamic> _reservations = [];
  bool _isLoading = false;
  String _filter = 'toutes';
  
  List<dynamic> get reservations => _reservations;
  bool get isLoading => _isLoading;
  String get filter => _filter;
  
  List<dynamic> get filteredReservations {
    if (_filter == 'toutes') return _reservations;
    return _reservations.where((r) => r['statut'] == _filter).toList();
  }
  
  void setFilter(String filter) {
    _filter = filter;
    notifyListeners();
  }
  
  Future<void> fetchReservations() async {
    try {
      _isLoading = true;
      notifyListeners();
      
      final response = await _apiService.getManagerReservations();
      
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
  
  Future<void> updateStatus(int reservationId, String status) async {
    try {
      final response = await _apiService.updateReservationStatus(reservationId, status);
      
      if (response['success'] == true) {
        await fetchReservations();
      } else {
        throw Exception(response['message'] ?? 'Erreur lors de la mise à jour du statut');
      }
    } catch (e) {
      rethrow;
    }
  }
}

