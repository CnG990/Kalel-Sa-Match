import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/terrain_provider.dart';

class TerrainDetailDialog extends StatefulWidget {
  final Map<String, dynamic> terrain;

  const TerrainDetailDialog({super.key, required this.terrain});

  @override
  State<TerrainDetailDialog> createState() => _TerrainDetailDialogState();
}

class _TerrainDetailDialogState extends State<TerrainDetailDialog> {
  final _prixController = TextEditingController();
  bool _isEditingPrix = false;
  bool _isUpdating = false;

  @override
  void initState() {
    super.initState();
    _prixController.text = (widget.terrain['prix_heure'] ?? 0).toString();
  }

  @override
  void dispose() {
    _prixController.dispose();
    super.dispose();
  }

  Future<void> _updatePrix() async {
    final nouveauPrix = double.tryParse(_prixController.text);
    if (nouveauPrix == null || nouveauPrix <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Prix invalide')),
      );
      return;
    }

    setState(() => _isUpdating = true);

    try {
      await Provider.of<TerrainProvider>(context, listen: false)
          .updatePrix(widget.terrain['id'], nouveauPrix);

      if (mounted) {
        setState(() {
          _isEditingPrix = false;
          _isUpdating = false;
        });
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Prix mis à jour avec succès'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isUpdating = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erreur: ${e.toString()}')),
        );
      }
    }
  }

  Future<void> _toggleDisponibilite() async {
    try {
      await Provider.of<TerrainProvider>(context, listen: false)
          .toggleDisponibilite(widget.terrain['id']);

      if (mounted) {
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('État du terrain mis à jour'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erreur: ${e.toString()}')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final terrain = widget.terrain;
    final estActif = terrain['est_actif'] ?? false;

    return Dialog(
      child: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      terrain['nom'] ?? 'Terrain',
                      style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              _DetailRow('Adresse', terrain['adresse'] ?? ''),
              _DetailRow('Capacité', '${terrain['capacite'] ?? 0} personnes'),
              _DetailRow('Surface', '${terrain['surface'] ?? 0} m²'),
              const SizedBox(height: 16),
              // Prix
              Row(
                children: [
                  Expanded(
                    child: _isEditingPrix
                        ? TextField(
                            controller: _prixController,
                            keyboardType: TextInputType.number,
                            decoration: const InputDecoration(
                              labelText: 'Prix par heure (CFA)',
                              border: OutlineInputBorder(),
                            ),
                          )
                        : _DetailRow(
                            'Prix par heure',
                            '${terrain['prix_heure'] ?? 0} CFA',
                          ),
                  ),
                  if (_isEditingPrix) ...[
                    const SizedBox(width: 8),
                    IconButton(
                      icon: const Icon(Icons.check),
                      onPressed: _isUpdating ? null : _updatePrix,
                    ),
                    IconButton(
                      icon: const Icon(Icons.close),
                      onPressed: _isUpdating
                          ? null
                          : () {
                              setState(() {
                                _isEditingPrix = false;
                                _prixController.text =
                                    (terrain['prix_heure'] ?? 0).toString();
                              });
                            },
                    ),
                  ] else
                    IconButton(
                      icon: const Icon(Icons.edit),
                      onPressed: () {
                        setState(() => _isEditingPrix = true);
                      },
                    ),
                ],
              ),
              const SizedBox(height: 24),
              // Toggle disponibilité
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _toggleDisponibilite,
                  icon: Icon(estActif ? Icons.power_off : Icons.power),
                  label: Text(estActif ? 'Désactiver' : 'Activer'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: estActif ? Colors.red : Colors.green,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _DetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              label,
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: Colors.grey[700],
              ),
            ),
          ),
          Expanded(
            child: Text(value),
          ),
        ],
      ),
    );
  }
}

