import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  // Détecter la plateforme et utiliser la bonne URL
  static String get baseUrl {
    if (Platform.isAndroid) {
      // Sur Android, utiliser 10.0.2.2 pour accéder à localhost de la machine hôte
      return 'http://10.0.2.2:8000/api';
    } else if (Platform.isIOS) {
      // Sur iOS, utiliser localhost
      return 'http://localhost:8000/api';
    } else {
      // Pour web/desktop, utiliser 127.0.0.1
      return 'http://127.0.0.1:8000/api';
    }
  }
  
  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }
  
  Future<Map<String, String>> _getHeaders() async {
    final token = await _getToken();
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }
  
  Future<Map<String, dynamic>> _handleResponse(http.Response response) async {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return json.decode(response.body);
    } else {
      throw Exception('Erreur: ${response.statusCode} - ${response.body}');
    }
  }
  
  // Authentication
  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
      body: json.encode({
        'email': email,
        'password': password,
        'device_name': 'mobile_app',
      }),
    );
    return _handleResponse(response);
  }
  
  Future<Map<String, dynamic>> register(Map<String, dynamic> userData) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/register'),
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
      body: json.encode(userData),
    );
    return _handleResponse(response);
  }

  // Authentication par téléphone (OTP + PIN)
  Future<Map<String, dynamic>> sendOTP(String telephone, {bool forUpdate = false}) async {
    final headers = forUpdate ? await _getHeaders() : {'Content-Type': 'application/json', 'Accept': 'application/json'};
    final response = await http.post(
      Uri.parse('$baseUrl/auth/send-otp'),
      headers: headers,
      body: json.encode({
        'telephone': telephone,
        'for_update': forUpdate,
      }),
    );
    return _handleResponse(response);
  }

  Future<Map<String, dynamic>> verifyOTP(String telephone, String otpCode) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/verify-otp'),
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
      body: json.encode({
        'telephone': telephone,
        'otp_code': otpCode,
      }),
    );
    return _handleResponse(response);
  }

  Future<Map<String, dynamic>> setPIN(String telephone, String pin, String pinConfirmation) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/set-pin'),
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
      body: json.encode({
        'telephone': telephone,
        'pin': pin,
        'pin_confirmation': pinConfirmation,
      }),
    );
    return _handleResponse(response);
  }

  Future<Map<String, dynamic>> registerWithPhone({
    required String telephone,
    required String otpCode,
    required String pin,
    required String pinConfirmation,
    required String nom,
    required String prenom,
    String? email,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/register-phone'),
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
      body: json.encode({
        'telephone': telephone,
        'otp_code': otpCode,
        'pin': pin,
        'pin_confirmation': pinConfirmation,
        'nom': nom,
        'prenom': prenom,
        if (email != null && email.isNotEmpty) 'email': email,
      }),
    );
    return _handleResponse(response);
  }

  Future<Map<String, dynamic>> loginWithPhone({
    required String telephone,
    required String otpCode,
    required String pin,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login-phone'),
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
      body: json.encode({
        'telephone': telephone,
        'otp_code': otpCode,
        'pin': pin,
        'device_name': 'mobile_app',
      }),
    );
    return _handleResponse(response);
  }

  Future<Map<String, dynamic>> loginWithPIN({
    required String telephone,
    required String pin,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login-pin'),
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
      body: json.encode({
        'telephone': telephone,
        'pin': pin,
        'device_name': 'mobile_app',
      }),
    );
    return _handleResponse(response);
  }
  
  Future<void> logout() async {
    final headers = await _getHeaders();
    await http.post(
      Uri.parse('$baseUrl/auth/logout'),
      headers: headers,
    );
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
  }
  
  Future<Map<String, dynamic>> getProfile() async {
    final headers = await _getHeaders();
    final response = await http.get(
      Uri.parse('$baseUrl/user/profile'),
      headers: headers,
    );
    return _handleResponse(response);
  }

  Future<Map<String, dynamic>> updateProfile({
    String? nom,
    String? prenom,
    String? email,
  }) async {
    final headers = await _getHeaders();
    final response = await http.put(
      Uri.parse('$baseUrl/auth/update-profile'),
      headers: headers,
      body: json.encode({
        if (nom != null) 'nom': nom,
        if (prenom != null) 'prenom': prenom,
        if (email != null) 'email': email,
      }),
    );
    return _handleResponse(response);
  }

  Future<Map<String, dynamic>> updatePhoneWithOTP({
    required String nouveauTelephone,
    required String otpCode,
  }) async {
    final headers = await _getHeaders();
    final response = await http.post(
      Uri.parse('$baseUrl/auth/update-phone'),
      headers: headers,
      body: json.encode({
        'nouveau_telephone': nouveauTelephone,
        'otp_code': otpCode,
      }),
    );
    return _handleResponse(response);
  }
  
  // Terrains
  Future<Map<String, dynamic>> getTerrains({
    int page = 1,
    int perPage = 100,
    String? search,
    String? sortBy,
    String? sortDirection,
  }) async {
    final headers = await _getHeaders();
    final queryParams = <String, String>{
      'page': page.toString(),
      'per_page': perPage.toString(),
      if (search != null) 'search': search,
      if (sortBy != null) 'sort_by': sortBy,
      if (sortDirection != null) 'sort_direction': sortDirection,
    };
    
    final uri = Uri.parse('$baseUrl/terrains').replace(queryParameters: queryParams);
    final response = await http.get(uri, headers: headers);
    return _handleResponse(response);
  }
  
  Future<Map<String, dynamic>> getTerrain(int id) async {
    final headers = await _getHeaders();
    final response = await http.get(
      Uri.parse('$baseUrl/terrains/$id'),
      headers: headers,
    );
    return _handleResponse(response);
  }
  
  Future<Map<String, dynamic>> getNearbyTerrains(
    double latitude,
    double longitude,
    double radius,
  ) async {
    final headers = await _getHeaders();
    final response = await http.get(
      Uri.parse('$baseUrl/terrains/nearby?latitude=$latitude&longitude=$longitude&radius=$radius'),
      headers: headers,
    );
    return _handleResponse(response);
  }
  
  Future<Map<String, dynamic>> checkAvailability(
    int terrainId,
    String date,
    int duree,
  ) async {
    final headers = await _getHeaders();
    final response = await http.post(
      Uri.parse('$baseUrl/reservations/check-availability'),
      headers: headers,
      body: json.encode({
        'terrain_id': terrainId,
        'date_debut': date,
        'duree_heures': duree,
      }),
    );
    return _handleResponse(response);
  }
  
  // Reservations
  Future<Map<String, dynamic>> createReservation(Map<String, dynamic> data) async {
    final headers = await _getHeaders();
    final response = await http.post(
      Uri.parse('$baseUrl/reservations'),
      headers: headers,
      body: json.encode(data),
    );
    return _handleResponse(response);
  }
  
  Future<Map<String, dynamic>> getMyReservations() async {
    final headers = await _getHeaders();
    final response = await http.get(
      Uri.parse('$baseUrl/reservations/my-reservations'),
      headers: headers,
    );
    return _handleResponse(response);
  }
  
  // Reviews/Avis
  Future<Map<String, dynamic>> getTerrainReviews(int terrainId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/reviews/terrain/$terrainId'),
      headers: await _getHeaders(),
    );
    return _handleResponse(response);
  }

  Future<Map<String, dynamic>> createReview({
    required int terrainId,
    int? reservationId,
    required int note,
    String? commentaire,
  }) async {
    final headers = await _getHeaders();
    final response = await http.post(
      Uri.parse('$baseUrl/reviews/'),
      headers: headers,
      body: json.encode({
        'terrain_id': terrainId,
        if (reservationId != null) 'reservation_id': reservationId,
        'note': note,
        if (commentaire != null && commentaire.isNotEmpty) 'commentaire': commentaire,
      }),
    );
    return _handleResponse(response);
  }

  Future<Map<String, dynamic>> updateReview(int reviewId, {required int note, String? commentaire}) async {
    final headers = await _getHeaders();
    final response = await http.put(
      Uri.parse('$baseUrl/reviews/$reviewId'),
      headers: headers,
      body: json.encode({
        'note': note,
        if (commentaire != null && commentaire.isNotEmpty) 'commentaire': commentaire,
      }),
    );
    return _handleResponse(response);
  }

  Future<Map<String, dynamic>> deleteReview(int reviewId) async {
    final headers = await _getHeaders();
    final response = await http.delete(
      Uri.parse('$baseUrl/reviews/$reviewId'),
      headers: headers,
    );
    return _handleResponse(response);
  }

  Future<Map<String, dynamic>> canReviewTerrain(int terrainId) async {
    final headers = await _getHeaders();
    final response = await http.get(
      Uri.parse('$baseUrl/reviews/terrain/$terrainId/can-review'),
      headers: headers,
    );
    return _handleResponse(response);
  }

  Future<Map<String, dynamic>> getMyReviewForTerrain(int terrainId) async {
    final headers = await _getHeaders();
    final response = await http.get(
      Uri.parse('$baseUrl/reviews/terrain/$terrainId/my-review'),
      headers: headers,
    );
    return _handleResponse(response);
  }

  // Favorites
  Future<Map<String, dynamic>> getFavorites() async {
    final headers = await _getHeaders();
    final response = await http.get(
      Uri.parse('$baseUrl/favorites/'),
      headers: headers,
    );
    return _handleResponse(response);
  }
  
  Future<Map<String, dynamic>> addFavorite(int terrainId) async {
    final headers = await _getHeaders();
    final response = await http.post(
      Uri.parse('$baseUrl/favorites/terrain/$terrainId/toggle'),
      headers: headers,
    );
    return _handleResponse(response);
  }
  
  Future<Map<String, dynamic>> removeFavorite(int terrainId) async {
    final headers = await _getHeaders();
    final response = await http.post(
      Uri.parse('$baseUrl/favorites/terrain/$terrainId/toggle'),
      headers: headers,
    );
    return _handleResponse(response);
  }
  
  Future<Map<String, dynamic>> checkFavorite(int terrainId) async {
    final headers = await _getHeaders();
    final response = await http.get(
      Uri.parse('$baseUrl/favorites/terrain/$terrainId/check'),
      headers: headers,
    );
    return _handleResponse(response);
  }
  
  // Abonnements
  Future<Map<String, dynamic>> getAbonnements() async {
    final headers = await _getHeaders();
    final response = await http.get(
      Uri.parse('$baseUrl/abonnements'),
      headers: headers,
    );
    return _handleResponse(response);
  }

  Future<Map<String, dynamic>> souscrireAbonnement(
    int abonnementId,
    Map<String, dynamic> preferences,
  ) async {
    final headers = await _getHeaders();
    final response = await http.post(
      Uri.parse('$baseUrl/abonnements/$abonnementId/subscribe'),
      headers: headers,
      body: json.encode(preferences),
    );
    return _handleResponse(response);
  }

  // Paiements
  Future<Map<String, dynamic>> processSubscriptionPayment({
    required int subscriptionId,
    required double montant,
    required String methodePaiement, // 'mobile_money', 'wave', 'orange_money'
  }) async {
    final headers = await _getHeaders();
    final response = await http.post(
      Uri.parse('$baseUrl/paiements/subscription'),
      headers: headers,
      body: json.encode({
        'subscription_id': subscriptionId,
        'montant': montant,
        'methode_paiement': methodePaiement,
      }),
    );
    return _handleResponse(response);
  }

  Future<Map<String, dynamic>> processReservationPayment({
    required int reservationId,
    required double montant,
    required String methodePaiement, // 'mobile_money', 'wave', 'orange_money'
  }) async {
    final headers = await _getHeaders();
    final response = await http.post(
      Uri.parse('$baseUrl/paiements/reservation'),
      headers: headers,
      body: json.encode({
        'reservation_id': reservationId,
        'montant': montant,
        'methode_paiement': methodePaiement,
      }),
    );
    return _handleResponse(response);
  }
}

