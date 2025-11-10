import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../widgets/ksm_logo_icon.dart';
import 'review_screen.dart';

class ReviewsListScreen extends StatefulWidget {
  final int terrainId;

  const ReviewsListScreen({super.key, required this.terrainId});

  @override
  State<ReviewsListScreen> createState() => _ReviewsListScreenState();
}

class _ReviewsListScreenState extends State<ReviewsListScreen> {
  final ApiService _apiService = ApiService();
  List<dynamic> _reviews = [];
  Map<String, dynamic>? _statistics;
  bool _isLoading = true;
  String? _error;
  Map<String, dynamic>? _myReview;
  bool _canReview = false;

  @override
  void initState() {
    super.initState();
    _loadReviews();
    _checkCanReview();
    _loadMyReview();
  }

  Future<void> _loadReviews() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final response = await _apiService.getTerrainReviews(widget.terrainId);
      
      if (mounted) {
        if (response['success'] == true) {
          setState(() {
            _reviews = response['data'] ?? [];
            _statistics = response['statistiques'];
            _isLoading = false;
          });
        } else {
          setState(() {
            _error = response['message'] ?? 'Erreur lors du chargement des avis';
            _isLoading = false;
          });
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = 'Erreur: ${e.toString()}';
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _checkCanReview() async {
    try {
      final response = await _apiService.canReviewTerrain(widget.terrainId);
      if (mounted && response['success'] == true) {
        setState(() {
          _canReview = response['data']?['can_review'] ?? false;
        });
      }
    } catch (e) {
      // Ignorer l'erreur silencieusement
    }
  }

  Future<void> _loadMyReview() async {
    try {
      final response = await _apiService.getMyReviewForTerrain(widget.terrainId);
      if (mounted && response['success'] == true) {
        setState(() {
          _myReview = response['data'];
        });
      }
    } catch (e) {
      // Ignorer l'erreur silencieusement
    }
  }

  Future<void> _refresh() async {
    await Future.wait([
      _loadReviews(),
      _checkCanReview(),
      _loadMyReview(),
    ]);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Avis'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _refresh,
            tooltip: 'Actualiser',
          ),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: KsmLogoIcon(size: 24, color: Colors.white),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.error_outline, color: Colors.red.shade700, size: 60),
                        const SizedBox(height: 16),
                        Text(
                          _error!,
                          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                color: Colors.red.shade700,
                              ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: _refresh,
                          child: const Text('Réessayer'),
                        ),
                      ],
                    ),
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _refresh,
                  child: Column(
                    children: [
                      // Statistiques
                      if (_statistics != null)
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(16.0),
                          color: Theme.of(context).colorScheme.primaryContainer,
                          child: Column(
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(
                                    Icons.star,
                                    color: Colors.amber,
                                    size: 32,
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    '${(_statistics!['note_moyenne'] ?? 0).toStringAsFixed(1)}',
                                    style: Theme.of(context)
                                        .textTheme
                                        .headlineMedium
                                        ?.copyWith(
                                          fontWeight: FontWeight.bold,
                                        ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Text(
                                '${_statistics!['nombre_avis'] ?? 0} avis',
                                style: Theme.of(context).textTheme.bodyLarge,
                              ),
                            ],
                          ),
                        ),
                      
                      // Bouton pour laisser un avis
                      if (_canReview || _myReview != null)
                        Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: SizedBox(
                            width: double.infinity,
                            child: ElevatedButton.icon(
                              onPressed: () async {
                                final result = await Navigator.of(context).push(
                                  MaterialPageRoute(
                                    builder: (_) => ReviewScreen(
                                      terrainId: widget.terrainId,
                                      existingReview: _myReview,
                                    ),
                                  ),
                                );
                                if (result == true) {
                                  _refresh();
                                }
                              },
                              icon: Icon(_myReview != null ? Icons.edit : Icons.rate_review),
                              label: Text(_myReview != null 
                                  ? 'Modifier mon avis' 
                                  : 'Laisser un avis'),
                              style: ElevatedButton.styleFrom(
                                padding: const EdgeInsets.symmetric(vertical: 16),
                              ),
                            ),
                          ),
                        ),
                      
                      // Liste des avis
                      Expanded(
                        child: _reviews.isEmpty
                            ? Center(
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(
                                      Icons.rate_review_outlined,
                                      size: 64,
                                      color: Colors.grey[400],
                                    ),
                                    const SizedBox(height: 16),
                                    Text(
                                      'Aucun avis pour le moment',
                                      style: TextStyle(
                                        fontSize: 18,
                                        color: Colors.grey[600],
                                      ),
                                    ),
                                    const SizedBox(height: 8),
                                    Text(
                                      'Soyez le premier à laisser un avis !',
                                      style: TextStyle(
                                        fontSize: 14,
                                        color: Colors.grey[500],
                                      ),
                                    ),
                                  ],
                                ),
                              )
                            : ListView.builder(
                                padding: const EdgeInsets.all(16),
                                itemCount: _reviews.length,
                                itemBuilder: (context, index) {
                                  final review = _reviews[index];
                                  return Card(
                                    margin: const EdgeInsets.only(bottom: 12),
                                    child: Padding(
                                      padding: const EdgeInsets.all(16.0),
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            children: [
                                              CircleAvatar(
                                                backgroundColor: Theme.of(context)
                                                    .colorScheme
                                                    .primaryContainer,
                                                child: Text(
                                                  '${review['user']['nom']?[0] ?? ''}${review['user']['prenom']?[0] ?? ''}'
                                                      .toUpperCase(),
                                                  style: TextStyle(
                                                    color: Theme.of(context)
                                                        .colorScheme
                                                        .primary,
                                                    fontWeight: FontWeight.bold,
                                                  ),
                                                ),
                                              ),
                                              const SizedBox(width: 12),
                                              Expanded(
                                                child: Column(
                                                  crossAxisAlignment: CrossAxisAlignment.start,
                                                  children: [
                                                    Text(
                                                      '${review['user']['prenom'] ?? ''} ${review['user']['nom'] ?? ''}'
                                                          .trim(),
                                                      style: Theme.of(context)
                                                          .textTheme
                                                          .titleMedium
                                                          ?.copyWith(
                                                            fontWeight: FontWeight.bold,
                                                          ),
                                                    ),
                                                    Text(
                                                      review['date_formatee'] ?? '',
                                                      style: Theme.of(context)
                                                          .textTheme
                                                          .bodySmall
                                                          ?.copyWith(
                                                            color: Colors.grey[600],
                                                          ),
                                                    ),
                                                  ],
                                                ),
                                              ),
                                              Row(
                                                children: List.generate(5, (i) {
                                                  return Icon(
                                                    i < (review['note'] ?? 0)
                                                        ? Icons.star
                                                        : Icons.star_border,
                                                    size: 16,
                                                    color: Colors.amber,
                                                  );
                                                }),
                                              ),
                                            ],
                                          ),
                                          if (review['commentaire'] != null &&
                                              review['commentaire'].toString().isNotEmpty) ...[
                                            const SizedBox(height: 12),
                                            Text(
                                              review['commentaire'],
                                              style: Theme.of(context).textTheme.bodyMedium,
                                            ),
                                          ],
                                        ],
                                      ),
                                    ),
                                  );
                                },
                              ),
                      ),
                    ],
                  ),
                ),
    );
  }
}

