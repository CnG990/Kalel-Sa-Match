import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../services/api_service.dart';
import '../../providers/terrain_provider.dart';
import '../../widgets/ksm_logo_icon.dart';
import 'package:provider/provider.dart';
import 'payment_screen.dart';

class SubscriptionConfigScreen extends StatefulWidget {
  final Map<String, dynamic> abonnement;
  final int terrainId;

  const SubscriptionConfigScreen({
    super.key,
    required this.abonnement,
    required this.terrainId,
  });

  @override
  State<SubscriptionConfigScreen> createState() => _SubscriptionConfigScreenState();
}

class _SubscriptionConfigScreenState extends State<SubscriptionConfigScreen> {
  final ApiService _apiService = ApiService();
  Map<String, dynamic>? _terrain;
  bool _isLoading = true;
  bool _isSubscribing = false;

  // Configuration
  int _dureeSeance = 1; // heures
  int _nbSeances = 1; // par semaine
  double _acompte = 0.0; // Montant de l'acompte (calculé automatiquement)
  List<int> _joursPreferes = []; // 0=dimanche, 1=lundi, etc.
  List<String> _creneauxPreferes = []; // '08:00', '10:00', etc.

  final List<int> _dureesSeance = [1, 2, 3];
  final List<int> _nbSeancesOptions = [1, 2, 3];
  final List<String> _creneauxDisponibles = [
    '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'
  ];
  final List<Map<String, dynamic>> _joursSemaine = [
    {'id': 0, 'nom': 'Dim', 'nomComplet': 'Dimanche'},
    {'id': 1, 'nom': 'Lun', 'nomComplet': 'Lundi'},
    {'id': 2, 'nom': 'Mar', 'nomComplet': 'Mardi'},
    {'id': 3, 'nom': 'Mer', 'nomComplet': 'Mercredi'},
    {'id': 4, 'nom': 'Jeu', 'nomComplet': 'Jeudi'},
    {'id': 5, 'nom': 'Ven', 'nomComplet': 'Vendredi'},
    {'id': 6, 'nom': 'Sam', 'nomComplet': 'Samedi'},
  ];

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
    } catch (e) {
      setState(() => _isLoading = false);
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

  double _calculerPrix() {
    if (_terrain == null) return 0.0;
    // Prix réduit pour les abonnements : 20000 FCFA/heure (au lieu du prix normal)
    final prixHeureAbonnement = 20000.0; // Prix fixe pour les abonnements
    final dureeJours = _toInt(widget.abonnement['duree_jours']) ?? 30;
    
    // Calculer le nombre de semaines
    int nbSemaines = (dureeJours / 7).ceil();
    
    // Prix = prix_heure_abonnement * durée_séance * nb_séances * nb_semaines
    return prixHeureAbonnement * _dureeSeance * _nbSeances * nbSemaines;
  }

  double _calculerAcompte() {
    final prixTotal = _calculerPrix();
    // Acompte = 30% du prix total (ou montant minimum si défini)
    final acomptePourcentage = 0.30; // 30%
    final acompteCalcule = prixTotal * acomptePourcentage;
    // Arrondir à l'entier supérieur
    return acompteCalcule.ceilToDouble();
  }

  double? _toDouble(dynamic value) {
    if (value == null) return null;
    if (value is double) return value;
    if (value is int) return value.toDouble();
    if (value is String) {
      return double.tryParse(value);
    }
    return null;
  }

  int? _toInt(dynamic value) {
    if (value == null) return null;
    if (value is int) return value;
    if (value is double) return value.toInt();
    if (value is String) {
      return int.tryParse(value);
    }
    return null;
  }

  String _formatPrice(double price) {
    return price.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]},',
    );
  }

  Future<void> _souscrire() async {
    // Validation
    if (_joursPreferes.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Veuillez sélectionner au moins un jour'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    if (_creneauxPreferes.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Veuillez sélectionner au moins un créneau'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    setState(() => _isSubscribing = true);

    try {
      final prix = _calculerPrix();
      final acompte = _calculerAcompte();
      final payload = {
        'terrain_id': widget.terrainId,
        'duree_seance': _dureeSeance,
        'nb_seances': _nbSeances,
        'prix_total': prix,
        'mode_paiement': 'differe', // Paiement différé avec acompte (30% par défaut)
        'jours_preferes': _joursPreferes,
        'creneaux_preferes': _creneauxPreferes,
        'preferences_flexibles': true,
      };

      final response = await _apiService.souscrireAbonnement(
        _toInt(widget.abonnement['id']) ?? 0,
        payload,
      );

      if (mounted) {
        setState(() => _isSubscribing = false);

        if (response['success'] == true && response['data'] != null) {
          // Naviguer vers la page de paiement avec l'acompte
          final acompte = _calculerAcompte();
          Navigator.of(context).pushReplacement(
            MaterialPageRoute(
              builder: (_) => PaymentScreen(
                subscriptionDetails: {
                  'subscriptionId': response['data']['abonnement_id'],
                  'terrainName': response['data']['terrain_nom'] ?? _terrain?['nom'] ?? 'Terrain',
                  'totalAmount': response['data']['prix_total'] ?? prix,
                  'acompte': acompte,
                  'duration': response['data']['type_abonnement'] ?? widget.abonnement['nom'],
                  'startDate': response['data']['date_debut'],
                  'endDate': response['data']['date_fin'],
                  'status': response['data']['statut'],
                },
              ),
            ),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(response['message'] ?? 'Erreur lors de la souscription'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSubscribing = false);
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
          title: const Text('Configuration de l\'abonnement'),
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

    final prix = _calculerPrix();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Configuration de l\'abonnement'),
        actions: [
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: KsmLogoIcon(size: 24, color: Colors.white),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Informations de l'abonnement
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.abonnement['nom'] ?? 'Abonnement',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    const SizedBox(height: 8),
                    if (widget.abonnement['description'] != null)
                      Text(
                        widget.abonnement['description'],
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            // Terrain sélectionné
            if (_terrain != null) ...[
              Text(
                'Terrain sélectionné',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(height: 8),
              Card(
                child: ListTile(
                    leading: KsmLogoIcon(size: 24),
                  title: Text(_terrain!['nom'] ?? 'Terrain'),
                  subtitle: Text(_terrain!['adresse'] ?? ''),
                  trailing: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        '20,000 FCFA/h',
                        style: TextStyle(
                          color: Theme.of(context).colorScheme.primary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        'Prix abonnement',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: Colors.grey[600],
                            ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),
            ],
            // Configuration
            Text(
              'Configuration',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 16),
            // Durée d'une séance
            Text(
              'Durée d\'une séance (heures)',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w500,
                  ),
            ),
            const SizedBox(height: 8),
            SegmentedButton<int>(
              segments: _dureesSeance.map((d) => ButtonSegment(
                value: d,
                label: Text('$d h'),
              )).toList(),
              selected: {_dureeSeance},
              onSelectionChanged: (Set<int> newSelection) {
                setState(() => _dureeSeance = newSelection.first);
              },
            ),
            const SizedBox(height: 24),
            // Nombre de séances par semaine
            Text(
              'Nombre de séances par semaine',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w500,
                  ),
            ),
            const SizedBox(height: 8),
            SegmentedButton<int>(
              segments: _nbSeancesOptions.map((nb) => ButtonSegment(
                value: nb,
                label: Text('$nb'),
              )).toList(),
              selected: {_nbSeances},
              onSelectionChanged: (Set<int> newSelection) {
                setState(() => _nbSeances = newSelection.first);
              },
            ),
            const SizedBox(height: 32),
            // Sélection des jours
            Text(
              'Jours de la semaine',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w500,
                  ),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _joursSemaine.map((jour) {
                final isSelected = _joursPreferes.contains(jour['id']);
                return FilterChip(
                  label: Text(jour['nom']),
                  selected: isSelected,
                  onSelected: (selected) {
                    setState(() {
                      if (selected) {
                        _joursPreferes.add(jour['id']);
                      } else {
                        _joursPreferes.remove(jour['id']);
                      }
                    });
                  },
                );
              }).toList(),
            ),
            const SizedBox(height: 24),
            // Sélection des créneaux
            Text(
              'Créneaux horaires',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w500,
                  ),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _creneauxDisponibles.map((creneau) {
                final isSelected = _creneauxPreferes.contains(creneau);
                return FilterChip(
                  label: Text(creneau),
                  selected: isSelected,
                  onSelected: (selected) {
                    setState(() {
                      if (selected) {
                        _creneauxPreferes.add(creneau);
                      } else {
                        _creneauxPreferes.remove(creneau);
                      }
                    });
                  },
                );
              }).toList(),
            ),
            const SizedBox(height: 32),
            // Résumé et prix
            Card(
              color: Theme.of(context).colorScheme.primaryContainer,
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Prix total',
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.w500,
                              ),
                        ),
                        Text(
                          '${_formatPrice(prix)} FCFA',
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                        ),
                      ],
                    ),
                    const Divider(),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Acompte (30%)',
                              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                    fontWeight: FontWeight.bold,
                                  ),
                            ),
                            Text(
                              'Solde à payer plus tard',
                              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                    color: Colors.grey[600],
                                  ),
                            ),
                          ],
                        ),
                        Text(
                          '${_formatPrice(_calculerAcompte())} FCFA',
                          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                fontWeight: FontWeight.bold,
                                color: Theme.of(context).colorScheme.primary,
                              ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            // Bouton souscrire
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isSubscribing ? null : _souscrire,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green[600],
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: _isSubscribing
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                        ),
                      )
                    : Text(
                        'Payer l\'acompte de ${_formatPrice(_calculerAcompte())} FCFA',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

