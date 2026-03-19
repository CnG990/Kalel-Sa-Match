import React, { useState, useEffect } from 'react';
import { Save, Loader2, Navigation, User } from 'lucide-react';
import toast from 'react-hot-toast';

interface Gestionnaire {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  nom_entreprise?: string;
}

const AjouterTerrainMobile: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [gestionnaires, setGestionnaires] = useState<Gestionnaire[]>([]);
  
  // Localisation
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  // Champs obligatoires
  const [nom, setNom] = useState('');
  const [prixHeure, setPrixHeure] = useState('');
  const [capacite, setCapacite] = useState('');
  
  // Champs optionnels
  const [adresse, setAdresse] = useState('');
  const [description, setDescription] = useState('');
  const [surfaceM2, setSurfaceM2] = useState('');
  const [gestionnaireId, setGestionnaireId] = useState('');
  const [telephone, setTelephone] = useState('77 617 32 61');
  const [typeSurface, setTypeSurface] = useState('gazon_synthetique');
  const [eclairage, setEclairage] = useState(true);
  const [vestiaires, setVestiaires] = useState(false);
  const [parking, setParking] = useState(false);

  // Charger gestionnaires
  useEffect(() => {
    fetchGestionnaires();
  }, []);

  const fetchGestionnaires = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/admin/terrain-mobile/gestionnaires_disponibles/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      if (result.meta.success) {
        setGestionnaires(result.data);
      }
    } catch (error) {
      console.error('Erreur chargement gestionnaires:', error);
    }
  };

  const getLocation = () => {
    setLoadingLocation(true);
    
    if (!navigator.geolocation) {
      toast.error('Géolocalisation non supportée');
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
        toast.success(`Position obtenue: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        setLoadingLocation(false);
        
        // Reverse geocoding pour obtenir l'adresse (optionnel)
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
          .then(res => res.json())
          .then(data => {
            if (data.display_name) {
              setAdresse(data.display_name);
            }
          })
          .catch(() => {});
      },
      (error) => {
        toast.error('Impossible d\'obtenir la position');
        console.error(error);
        setLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!location) {
      toast.error('Veuillez obtenir votre position GPS');
      return;
    }

    if (!nom || !prixHeure || !capacite) {
      toast.error('Nom, prix/heure et capacité sont obligatoires');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const data = {
        nom,
        latitude: location.lat,
        longitude: location.lng,
        prix_heure: parseFloat(prixHeure),
        capacite: parseInt(capacite),
        adresse: adresse || 'Adresse à définir',
        description,
        surface_m2: surfaceM2 ? parseFloat(surfaceM2) : null,
        gestionnaire_id: gestionnaireId ? parseInt(gestionnaireId) : null,
        telephone,
        type_surface: typeSurface,
        disponible_eclairage: eclairage,
        disponible_vestiaires: vestiaires,
        disponible_parking: parking,
      };

      const response = await fetch('http://127.0.0.1:8000/api/admin/terrain-mobile/create_on_site/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.meta.success) {
        toast.success(`Terrain "${nom}" créé avec succès !`);
        // Reset form
        setNom('');
        setPrixHeure('');
        setCapacite('');
        setAdresse('');
        setDescription('');
        setSurfaceM2('');
        setGestionnaireId('');
        setLocation(null);
        setTelephone('77 617 32 61');
      } else {
        toast.error(result.meta.message || 'Erreur lors de la création');
      }
    } catch (error) {
      toast.error('Erreur réseau');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
        📍 Ajouter Terrain Sur Place
      </h1>

      {/* Géolocalisation */}
      <div style={{
        background: location ? '#d1fae5' : '#fef3c7',
        padding: '16px',
        borderRadius: '12px',
        marginBottom: '20px',
      }}>
        <button
          onClick={getLocation}
          disabled={loadingLocation}
          style={{
            width: '100%',
            padding: '12px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: loadingLocation ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
          }}
        >
          {loadingLocation ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Navigation size={20} />
          )}
          {loadingLocation ? 'Obtention position...' : 'Obtenir Ma Position GPS'}
        </button>
        
        {location && (
          <div style={{ marginTop: '12px', fontSize: '14px', color: '#065f46' }}>
            ✓ Position: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
          </div>
        )}
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit}>
        {/* Nom */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
            Nom du terrain <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Ex: Terrain Municipal Dakar"
            required
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '16px',
            }}
          />
        </div>

        {/* Prix/Heure */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
            Prix/Heure (FCFA) <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="number"
            value={prixHeure}
            onChange={(e) => setPrixHeure(e.target.value)}
            placeholder="Ex: 15000"
            required
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '16px',
            }}
          />
        </div>

        {/* Capacité */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
            Capacité (joueurs) <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="number"
            value={capacite}
            onChange={(e) => setCapacite(e.target.value)}
            placeholder="Ex: 22"
            required
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '16px',
            }}
          />
        </div>

        {/* Adresse */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
            Adresse
          </label>
          <input
            type="text"
            value={adresse}
            onChange={(e) => setAdresse(e.target.value)}
            placeholder="Auto-détecté ou manuel"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '16px',
            }}
          />
        </div>

        {/* Surface */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
            Surface (m²)
          </label>
          <input
            type="number"
            step="0.01"
            value={surfaceM2}
            onChange={(e) => setSurfaceM2(e.target.value)}
            placeholder="Ex: 1000"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '16px',
            }}
          />
        </div>

        {/* Type Surface */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
            Type de surface
          </label>
          <select
            value={typeSurface}
            onChange={(e) => setTypeSurface(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '16px',
            }}
          >
            <option value="gazon_synthetique">Gazon Synthétique</option>
            <option value="gazon_naturel">Gazon Naturel</option>
            <option value="beton">Béton</option>
            <option value="terre_battue">Terre Battue</option>
          </select>
        </div>

        {/* Gestionnaire */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
            <User size={16} style={{ display: 'inline', marginRight: '4px' }} />
            Assigner à un gestionnaire
          </label>
          <select
            value={gestionnaireId}
            onChange={(e) => setGestionnaireId(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '16px',
            }}
          >
            <option value="">Aucun (admin gère)</option>
            {gestionnaires.map((g) => (
              <option key={g.id} value={g.id}>
                {g.prenom} {g.nom} {g.nom_entreprise ? `(${g.nom_entreprise})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Téléphone */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
            Téléphone / WhatsApp
          </label>
          <input
            type="text"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '16px',
            }}
          />
        </div>

        {/* Équipements */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '12px' }}>
            Équipements disponibles
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={eclairage}
                onChange={(e) => setEclairage(e.target.checked)}
              />
              Éclairage nocturne
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={vestiaires}
                onChange={(e) => setVestiaires(e.target.checked)}
              />
              Vestiaires
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={parking}
                onChange={(e) => setParking(e.target.checked)}
              />
              Parking
            </label>
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description du terrain..."
            rows={4}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '16px',
              resize: 'vertical',
            }}
          />
        </div>

        {/* Bouton Submit */}
        <button
          type="submit"
          disabled={loading || !location}
          style={{
            width: '100%',
            padding: '14px',
            background: loading || !location ? '#9ca3af' : '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: loading || !location ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
          {loading ? 'Création...' : 'Créer le Terrain'}
        </button>
      </form>
    </div>
  );
};

export default AjouterTerrainMobile;
