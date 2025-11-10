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
  
  // Manager Dashboard
  Future<Map<String, dynamic>> getManagerStats() async {
    final headers = await _getHeaders();
    final response = await http.get(
      Uri.parse('$baseUrl/manager/stats/dashboard'),
      headers: headers,
    );
    return _handleResponse(response);
  }
  
  // Manager Revenue Stats
  Future<Map<String, dynamic>> getManagerRevenueStats() async {
    final headers = await _getHeaders();
    final response = await http.get(
      Uri.parse('$baseUrl/manager/stats/revenue'),
      headers: headers,
    );
    return _handleResponse(response);
  }
  
  // Terrains
  Future<Map<String, dynamic>> getManagerTerrains() async {
    final headers = await _getHeaders();
    final response = await http.get(
      Uri.parse('$baseUrl/manager/terrains'),
      headers: headers,
    );
    return _handleResponse(response);
  }
  
  Future<Map<String, dynamic>> updateTerrainPrix(int terrainId, double nouveauPrix) async {
    final headers = await _getHeaders();
    final response = await http.put(
      Uri.parse('$baseUrl/terrains/$terrainId/prix'),
      headers: headers,
      body: json.encode({'prix_heure': nouveauPrix}),
    );
    return _handleResponse(response);
  }
  
  Future<Map<String, dynamic>> toggleTerrainDisponibilite(int terrainId) async {
    final headers = await _getHeaders();
    final response = await http.put(
      Uri.parse('$baseUrl/manager/terrains/$terrainId/toggle-disponibilite'),
      headers: headers,
    );
    return _handleResponse(response);
  }
  
  // Reservations
  Future<Map<String, dynamic>> getManagerReservations() async {
    final headers = await _getHeaders();
    final response = await http.get(
      Uri.parse('$baseUrl/manager/reservations'),
      headers: headers,
    );
    return _handleResponse(response);
  }
  
  Future<Map<String, dynamic>> updateReservationStatus(int reservationId, String status) async {
    final headers = await _getHeaders();
    final response = await http.put(
      Uri.parse('$baseUrl/manager/reservations/$reservationId/status'),
      headers: headers,
      body: json.encode({'statut': status}),
    );
    return _handleResponse(response);
  }
  
  // Revenue
  Future<Map<String, dynamic>> getManagerRevenue({String period = '30'}) async {
    final headers = await _getHeaders();
    final response = await http.get(
      Uri.parse('$baseUrl/manager/stats/revenue?period=$period'),
      headers: headers,
    );
    return _handleResponse(response);
  }
  
  // QR Code
  Future<Map<String, dynamic>> validateTicketCode(String codeTicket) async {
    final headers = await _getHeaders();
    final response = await http.post(
      Uri.parse('$baseUrl/manager/validate-ticket'),
      headers: headers,
      body: json.encode({'ticket_code': codeTicket}),
    );
    return _handleResponse(response);
  }
}

