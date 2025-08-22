interface TerrainData {
  id: number;
  nom: string;
  prix_heure: number;
  capacite?: number;
}

interface PricingRule {
  base_multiplier: number;
  extra_cost?: number;
}

interface TerrainOption {
  id: string;
  name: string;
  price: number;
  capacity: number;
  duration?: number;
  description: string;
  allowedDays?: number[];
  restrictions?: string[];
  allowedHours?: { start: number; end: number };
}

class TerrainPricingService {
  // Configuration des règles de prix par terrain
  private static readonly TERRAIN_RULES = {
    sowfoot: {
      '5x5': {
        dimanche: {
          '1h': { base_multiplier: 0.6 },      // 60% du prix de base
          '1h30': { base_multiplier: 0.8 },    // 80% du prix de base
        },
        weekend: {
          '1h': { base_multiplier: 0.8 },      // 80% du prix de base
          // Pas de 1h30 en weekend
        },
      },
      '8x8': {
        semaine: {
          '1h': { base_multiplier: 1.2 },      // 120% du prix de base
          '1h30': { base_multiplier: 1.4 },    // 140% du prix de base
        },
        weekend: {
          '1h': { base_multiplier: 1.4 },      // 140% du prix de base
          // Pas de 1h30 en weekend
        },
      },
    },
    complexe_be_sport: {
      petit_terrain: { base_multiplier: 1.0 },
      grand_terrain_semaine: { base_multiplier: 1.5 },
      grand_terrain_weekend: { base_multiplier: 2.0 },
    },
    fara_foot: {
      jour: { base_multiplier: 1.0 },
      nuit: { base_multiplier: 1.33 },
    },
    fit_park_academy: {
      '5x5': { base_multiplier: 1.0 },
      '8x8': { base_multiplier: 2.67 },
      '11x11': { base_multiplier: 4.0 },
    },
  };

  private static readonly DURATION_EXTRAS = {
    '90_minutes_extra': 5000, // +5000 FCFA pour passer de 1h à 1h30
  };

  /**
   * Calcule le prix dynamique basé sur les données terrain
   */
  static calculatePrice(terrainData: TerrainData, option: string, duration: number = 1): number {
    const basePrice = terrainData.prix_heure;
    const terrainKey = terrainData.nom.toLowerCase().replace(/\s+/g, '_');

    // Règles spécifiques par terrain
    if (terrainKey === 'sowfoot') {
      return this.calculateSowfootPrice(basePrice, option, duration);
    }

    // Autres terrains avec leurs règles
    const rules = this.TERRAIN_RULES[terrainKey as keyof typeof this.TERRAIN_RULES];
    if (rules && typeof rules === 'object') {
      const rule = rules[option as keyof typeof rules] as PricingRule;
      if (rule) {
        let price = basePrice * rule.base_multiplier;
        
        // Ajouter les coûts supplémentaires pour la durée
        if (duration === 1.5) {
          price += this.DURATION_EXTRAS['90_minutes_extra'];
        }
        
        return Math.round(price);
      }
    }

    // Prix par défaut basé sur la durée
    let price = basePrice * duration;
    if (duration === 1.5) {
      price += this.DURATION_EXTRAS['90_minutes_extra'];
    }
    
    return Math.round(price);
  }

  /**
   * Calcul spécifique pour Sowfoot
   */
  private static calculateSowfootPrice(basePrice: number, option: string, duration: number): number {
    const rules = this.TERRAIN_RULES.sowfoot;
    
    // Identifier le format et la période
    let format: '5x5' | '8x8' = '5x5';
    let period: string = 'semaine';
    
    if (option.includes('8x8')) format = '8x8';
    if (option.includes('dimanche')) period = 'dimanche';
    if (option.includes('weekend')) period = 'weekend';

    const formatRules = rules[format];
    const periodRules = formatRules[period as keyof typeof formatRules];
    
    if (periodRules) {
      const durationKey = duration === 1.5 ? '1h30' : '1h';
      const rule = periodRules[durationKey as keyof typeof periodRules] as PricingRule;
      
      if (rule) {
        return Math.round(basePrice * rule.base_multiplier);
      }
    }

    // Fallback
    return Math.round(basePrice * duration);
  }

  /**
   * Génère les options pour un terrain donné
   */
  static generateOptionsForTerrain(terrainData: TerrainData): TerrainOption[] {
    const terrainKey = terrainData.nom.toLowerCase().replace(/\s+/g, '_');

    switch (terrainKey) {
      case 'sowfoot':
        return this.generateSowfootOptions(terrainData);
      case 'complexe_be_sport':
        return this.generateBeSportOptions(terrainData);
      case 'fara_foot':
        return this.generateFaraFootOptions(terrainData);
      case 'fit_park_academy':
        return this.generateFitParkOptions(terrainData);
      default:
        return this.generateDefaultOptions(terrainData);
    }
  }

  /**
   * Options spécifiques pour Sowfoot
   */
  private static generateSowfootOptions(terrainData: TerrainData): TerrainOption[] {
    return [
      {
        id: 'sowfoot-5x5-dimanche-1h',
        name: '5x5 Dimanche (1h)',
        price: this.calculatePrice(terrainData, '5x5_dimanche', 1),
        capacity: 10,
        duration: 1,
        description: `${this.calculatePrice(terrainData, '5x5_dimanche', 1).toLocaleString()} FCFA pour 1h - Dimanche uniquement`,
        allowedDays: [0],
        restrictions: ['Dimanche uniquement', 'Crampons interdits']
      },
      {
        id: 'sowfoot-5x5-dimanche-90mn',
        name: '5x5 Dimanche (1h30)',
        price: this.calculatePrice(terrainData, '5x5_dimanche', 1.5),
        capacity: 10,
        duration: 1.5,
        description: `${this.calculatePrice(terrainData, '5x5_dimanche', 1.5).toLocaleString()} FCFA pour 1h30 - Dimanche uniquement`,
        allowedDays: [0],
        restrictions: ['Dimanche uniquement', 'Crampons interdits']
      },
      {
        id: 'sowfoot-5x5-weekend-1h',
        name: '5x5 Vendredi-Samedi (1h)',
        price: this.calculatePrice(terrainData, '5x5_weekend', 1),
        capacity: 10,
        duration: 1,
        description: `${this.calculatePrice(terrainData, '5x5_weekend', 1).toLocaleString()} FCFA pour 1h - Vendredi et Samedi`,
        allowedDays: [5, 6],
        restrictions: ['Vendredi-Samedi uniquement', 'Crampons interdits', 'Pas de créneaux 1h30 ces jours']
      },
      {
        id: 'sowfoot-8x8-semaine-1h',
        name: '8x8 Dimanche-Jeudi (1h)',
        price: this.calculatePrice(terrainData, '8x8_semaine', 1),
        capacity: 16,
        duration: 1,
        description: `${this.calculatePrice(terrainData, '8x8_semaine', 1).toLocaleString()} FCFA/h - Dimanche à Jeudi`,
        allowedDays: [0, 1, 2, 3, 4],
        restrictions: ['Dimanche à Jeudi uniquement', 'Crampons interdits']
      },
      {
        id: 'sowfoot-8x8-semaine-90mn',
        name: '8x8 Dimanche-Jeudi (1h30)',
        price: this.calculatePrice(terrainData, '8x8_semaine', 1.5),
        capacity: 16,
        duration: 1.5,
        description: `${this.calculatePrice(terrainData, '8x8_semaine', 1.5).toLocaleString()} FCFA pour 1h30 - Dimanche à Jeudi`,
        allowedDays: [0, 1, 2, 3, 4],
        restrictions: ['Dimanche à Jeudi uniquement', 'Crampons interdits']
      },
      {
        id: 'sowfoot-8x8-weekend-1h',
        name: '8x8 Vendredi-Samedi (1h)',
        price: this.calculatePrice(terrainData, '8x8_weekend', 1),
        capacity: 16,
        duration: 1,
        description: `${this.calculatePrice(terrainData, '8x8_weekend', 1).toLocaleString()} FCFA pour 1h - Vendredi et Samedi`,
        allowedDays: [5, 6],
        restrictions: ['Vendredi-Samedi uniquement', 'Crampons interdits', 'Pas de créneaux 1h30 ces jours']
      }
    ];
  }

  /**
   * Options par défaut pour terrains sans règles spécifiques
   */
  private static generateDefaultOptions(terrainData: TerrainData): TerrainOption[] {
    return [
      {
        id: 'default-1h',
        name: 'Réservation standard (1h)',
        price: terrainData.prix_heure,
        capacity: terrainData.capacite || 22,
        duration: 1,
        description: `${terrainData.prix_heure.toLocaleString()} FCFA/h - Tous les jours`,
        allowedDays: [0, 1, 2, 3, 4, 5, 6], // Tous les jours
        allowedHours: { start: 8, end: 22 }, // 8h à 22h
        restrictions: ['Crampons autorisés', 'Réservation minimum 1h']
      },
      {
        id: 'default-90mn',
        name: 'Réservation standard (1h30)',
        price: terrainData.prix_heure * 1.5 + this.DURATION_EXTRAS['90_minutes_extra'],
        capacity: terrainData.capacite || 22,
        duration: 1.5,
        description: `${(terrainData.prix_heure * 1.5 + this.DURATION_EXTRAS['90_minutes_extra']).toLocaleString()} FCFA pour 1h30 - Tous les jours`,
        allowedDays: [0, 1, 2, 3, 4, 5, 6], // Tous les jours
        allowedHours: { start: 8, end: 21 }, // 8h à 21h (pour finir à 22h30 max)
        restrictions: ['Crampons autorisés', 'Réservation 1h30']
      },
      {
        id: 'default-2h',
        name: 'Réservation longue (2h)',
        price: terrainData.prix_heure * 2,
        capacity: terrainData.capacite || 22,
        duration: 2,
        description: `${(terrainData.prix_heure * 2).toLocaleString()} FCFA pour 2h - Tous les jours`,
        allowedDays: [0, 1, 2, 3, 4, 5, 6], // Tous les jours
        allowedHours: { start: 8, end: 20 }, // 8h à 20h (pour finir à 22h max)
        restrictions: ['Crampons autorisés', 'Réservation longue durée']
      }
    ];
  }

  /**
   * Options pour Complexe Be Sport - PRIX VARIABLES SELON L'HEURE
   * 30,000 FCFA le matin (8h-17h) / 50,000 FCFA le soir (18h-23h)
   * PAS DE 1h30 - Uniquement 1h
   */
  private static generateBeSportOptions(terrainData: TerrainData): TerrainOption[] {
    const capacity = terrainData.capacite || 22;
    
    return [
      {
        id: 'besport-matin-1h',
        name: 'Complexe Be Sport - Matin (1h)',
        price: 30000, // ✅ Prix fixe matin
        capacity: capacity,
        duration: 1,
        description: '30,000 FCFA pour 1h - Créneaux matinaux (8h-17h)',
        allowedDays: [0, 1, 2, 3, 4, 5, 6], // Tous les jours
        allowedHours: { start: 8, end: 17 }, // 8h à 17h
        restrictions: ['Crampons autorisés', 'Créneaux matinaux uniquement', 'Éclairage disponible']
      },
      {
        id: 'besport-soir-1h',
        name: 'Complexe Be Sport - Soir (1h)',
        price: 50000, // ✅ Prix fixe soir
        capacity: capacity,
        duration: 1,
        description: '50,000 FCFA pour 1h - Créneaux en soirée (18h-23h)',
        allowedDays: [0, 1, 2, 3, 4, 5, 6], // Tous les jours
        allowedHours: { start: 18, end: 23 }, // 18h à 23h
        restrictions: ['Crampons autorisés', 'Créneaux en soirée uniquement', 'Éclairage disponible']
      }
    ];
  }

  /**
   * Options pour Fara Foot
   */
  private static generateFaraFootOptions(terrainData: TerrainData): TerrainOption[] {
    return [
      {
        id: 'fara-jour-1h',
        name: 'Tarif jour (1h)',
        price: this.calculatePrice(terrainData, 'jour'),
        capacity: 10,
        duration: 1,
        description: `${this.calculatePrice(terrainData, 'jour').toLocaleString()} FCFA/h - Tarif réduit jour`,
        allowedDays: [1, 2, 3, 4, 5], // Lundi à Vendredi
        allowedHours: { start: 8, end: 15 }, // 8h à 15h
        restrictions: ['8h à 15h uniquement', 'Lundi à Vendredi', 'Tarif jour']
      },
      {
        id: 'fara-jour-90mn',
        name: 'Tarif jour (1h30)',
        price: this.calculatePrice(terrainData, 'jour', 1.5),
        capacity: 10,
        duration: 1.5,
        description: `${this.calculatePrice(terrainData, 'jour', 1.5).toLocaleString()} FCFA pour 1h30 - Tarif réduit jour`,
        allowedDays: [1, 2, 3, 4, 5], // Lundi à Vendredi
        allowedHours: { start: 8, end: 14 }, // 8h à 14h (pour finir à 15h30)
        restrictions: ['8h à 14h uniquement', 'Lundi à Vendredi', 'Tarif jour']
      },
      {
        id: 'fara-soir-1h',
        name: 'Tarif soir/weekend (1h)',
        price: this.calculatePrice(terrainData, 'soir'),
        capacity: 10,
        duration: 1,
        description: `${this.calculatePrice(terrainData, 'soir').toLocaleString()} FCFA/h - Tarif soir/weekend`,
        allowedDays: [0, 1, 2, 3, 4, 5, 6], // Tous les jours
        allowedHours: { start: 15, end: 23 }, // 15h à 23h en semaine, toute la journée weekend
        restrictions: ['Après 15h en semaine', 'Toute la journée weekend', 'Tarif standard']
      },
      {
        id: 'fara-soir-90mn',
        name: 'Tarif soir/weekend (1h30)',
        price: this.calculatePrice(terrainData, 'soir', 1.5),
        capacity: 10,
        duration: 1.5,
        description: `${this.calculatePrice(terrainData, 'soir', 1.5).toLocaleString()} FCFA pour 1h30 - Tarif soir/weekend`,
        allowedDays: [0, 1, 2, 3, 4, 5, 6], // Tous les jours
        allowedHours: { start: 15, end: 22 }, // 15h à 22h (pour finir à 23h30)
        restrictions: ['Après 15h en semaine', 'Toute la journée weekend', 'Tarif standard']
      }
    ];
  }

  /**
   * Options pour Fit Park Academy
   */
  private static generateFitParkOptions(terrainData: TerrainData): TerrainOption[] {
    return [
      {
        id: 'fit-5x5-1h',
        name: 'Terrain 5x5/6x6 (1h)',
        price: this.calculatePrice(terrainData, '5x5'),
        capacity: 10,
        duration: 1,
        description: `${this.calculatePrice(terrainData, '5x5').toLocaleString()} FCFA/h - Petit terrain`,
        allowedDays: [0, 1, 2, 3, 4, 5, 6], // Tous les jours
        allowedHours: { start: 8, end: 22 }, // 8h à 22h
        restrictions: ['Terrain 5x5/6x6', 'Crampons autorisés', 'Académie de formation']
      },
      {
        id: 'fit-5x5-90mn',
        name: 'Terrain 5x5/6x6 (1h30)',
        price: this.calculatePrice(terrainData, '5x5', 1.5),
        capacity: 10,
        duration: 1.5,
        description: `${this.calculatePrice(terrainData, '5x5', 1.5).toLocaleString()} FCFA pour 1h30 - Petit terrain`,
        allowedDays: [0, 1, 2, 3, 4, 5, 6], // Tous les jours
        allowedHours: { start: 8, end: 21 }, // 8h à 21h (pour finir à 22h30)
        restrictions: ['Terrain 5x5/6x6', 'Crampons autorisés', 'Académie de formation']
      },
      {
        id: 'fit-8x8-1h',
        name: 'Terrain 8x8 (1h)',
        price: this.calculatePrice(terrainData, '8x8'),
        capacity: 16,
        duration: 1,
        description: `${this.calculatePrice(terrainData, '8x8').toLocaleString()} FCFA/h - Terrain intermédiaire`,
        allowedDays: [0, 1, 2, 3, 4, 5, 6], // Tous les jours
        allowedHours: { start: 8, end: 22 }, // 8h à 22h
        restrictions: ['Terrain 8x8', 'Crampons autorisés', 'Académie de formation']
      },
      {
        id: 'fit-8x8-90mn',
        name: 'Terrain 8x8 (1h30)',
        price: this.calculatePrice(terrainData, '8x8', 1.5),
        capacity: 16,
        duration: 1.5,
        description: `${this.calculatePrice(terrainData, '8x8', 1.5).toLocaleString()} FCFA pour 1h30 - Terrain intermédiaire`,
        allowedDays: [0, 1, 2, 3, 4, 5, 6], // Tous les jours
        allowedHours: { start: 8, end: 21 }, // 8h à 21h
        restrictions: ['Terrain 8x8', 'Crampons autorisés', 'Académie de formation']
      },
      {
        id: 'fit-11x11-1h',
        name: 'Grand terrain 11x11 (1h)',
        price: this.calculatePrice(terrainData, '11x11'),
        capacity: 22,
        duration: 1,
        description: `${this.calculatePrice(terrainData, '11x11').toLocaleString()} FCFA/h - Grand terrain`,
        allowedDays: [0, 1, 2, 3, 4, 5, 6], // Tous les jours
        allowedHours: { start: 8, end: 22 }, // 8h à 22h
        restrictions: ['Terrain 11x11', 'Crampons autorisés', 'Académie de formation']
      },
      {
        id: 'fit-11x11-90mn',
        name: 'Grand terrain 11x11 (1h30)',
        price: this.calculatePrice(terrainData, '11x11', 1.5),
        capacity: 22,
        duration: 1.5,
        description: `${this.calculatePrice(terrainData, '11x11', 1.5).toLocaleString()} FCFA pour 1h30 - Grand terrain`,
        allowedDays: [0, 1, 2, 3, 4, 5, 6], // Tous les jours
        allowedHours: { start: 8, end: 21 }, // 8h à 21h
        restrictions: ['Terrain 11x11', 'Crampons autorisés', 'Académie de formation']
      }
    ];
  }
}

export default TerrainPricingService; 