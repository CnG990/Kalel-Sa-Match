import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'providers/auth_provider.dart';
import 'providers/terrain_provider.dart';
import 'providers/reservation_provider.dart';
import 'screens/auth/phone_auth_screen.dart';
import 'screens/main_navigation.dart';
import 'services/api_service.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => TerrainProvider()),
        ChangeNotifierProvider(create: (_) => ReservationProvider()),
      ],
      child: MaterialApp(
        title: 'Kalel Sa Match',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xFF16a34a), // Vert principal
            primary: const Color(0xFF16a34a), // #16a34a
            secondary: const Color(0xFFea580c), // Orange #ea580c
            primaryContainer: const Color(0xFFdcfce7), // Vert clair
            secondaryContainer: const Color(0xFFfef3c7), // Orange clair
            surface: const Color(0xFFF8F9F4), // Fond crème
            onPrimary: Colors.white,
            onSecondary: Colors.white,
          ),
          useMaterial3: true,
          textTheme: GoogleFonts.interTextTheme(),
          appBarTheme: const AppBarTheme(
            centerTitle: true,
            elevation: 0,
            backgroundColor: Color(0xFF16a34a),
            foregroundColor: Colors.white,
          ),
        ),
        home: const AuthWrapper(),
      ),
    );
  }
}

class AuthWrapper extends StatelessWidget {
  const AuthWrapper({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, _) {
        if (authProvider.isLoading) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }
        
        if (authProvider.isAuthenticated) {
          return const MainNavigation();
        }
        
        return const PhoneAuthScreen();
      },
    );
  }
}

