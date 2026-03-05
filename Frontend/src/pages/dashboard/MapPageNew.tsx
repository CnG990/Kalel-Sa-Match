import React, { useState, useEffect } from 'react';
import { Search, Loader2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import LeafletMap from '../../components/LeafletMap';

interface Terrain {
  id: number;
  nom: string;
  adresse: string;
  latitude: number;
  longitude: number;
  prix_heure: number;
  capacite: number;
  statut_reservation?: 'libre' | 'reserve';
  est_actif: boolean;
  distance?: number;
}

const MapPageNew: React.FC = () => {
  const [terrains, setTerrains] = useState<Terrain[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTerrain, setSelectedTerrain] = useState<Terrain | null>(null);

  const fetchTerrains = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://127.0.0.1:8000/api/terrains/all-for-map', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.data) {
        setTerrains(result.data);
        toast.success(`${result.data.length} terrains chargés`);
      }
    } catch (error) {
      console.error('Erreur chargement terrains:', error);
      toast.error('Erreur lors du chargement de la carte');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTerrains();
  }, []);

  const filteredTerrains = terrains.filter(terrain =>
    terrain.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    terrain.adresse.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTerrainClick = (terrain: Terrain) => {
    setSelectedTerrain(terrain);
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)', background: '#f9fafb' }}>
      {/* Sidebar */}
      <div style={{
        width: '360px',
        background: 'white',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
            🗺️ Carte des Terrains
          </h1>
          
          {/* Recherche */}
          <div style={{ position: 'relative' }}>
            <Search
              size={20}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af',
              }}
            />
            <input
              type="text"
              placeholder="Rechercher un terrain..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 40px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
              }}
            />
          </div>

          <button
            onClick={fetchTerrains}
            disabled={loading}
            style={{
              marginTop: '12px',
              width: '100%',
              padding: '10px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            Actualiser
          </button>
        </div>

        {/* Liste terrains */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Loader2 size={32} className="animate-spin" style={{ color: '#3b82f6', margin: '0 auto' }} />
              <p style={{ marginTop: '12px', color: '#6b7280' }}>Chargement...</p>
            </div>
          ) : filteredTerrains.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
              Aucun terrain trouvé
            </div>
          ) : (
            filteredTerrains.map((terrain) => (
              <div
                key={terrain.id}
                onClick={() => handleTerrainClick(terrain)}
                style={{
                  padding: '16px',
                  marginBottom: '12px',
                  background: selectedTerrain?.id === terrain.id ? '#eff6ff' : 'white',
                  border: `2px solid ${selectedTerrain?.id === terrain.id ? '#3b82f6' : '#e5e7eb'}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (selectedTerrain?.id !== terrain.id) {
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedTerrain?.id !== terrain.id) {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', flex: 1 }}>{terrain.nom}</h3>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    background: terrain.statut_reservation === 'libre' ? '#d1fae5' : '#fee2e2',
                    color: terrain.statut_reservation === 'libre' ? '#065f46' : '#991b1b',
                  }}>
                    {terrain.statut_reservation === 'libre' ? '✓ LIBRE' : '✗ RÉSERVÉ'}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>
                  📍 {terrain.adresse}
                </p>
                <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#374151' }}>
                  <span>💰 {terrain.prix_heure} FCFA/h</span>
                  <span>👥 {terrain.capacite} pers.</span>
                  {terrain.distance && <span>📏 {terrain.distance.toFixed(1)} km</span>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Carte */}
      <div style={{ flex: 1, position: 'relative' }}>
        {loading ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            background: '#f9fafb',
          }}>
            <Loader2 size={48} className="animate-spin" style={{ color: '#3b82f6' }} />
          </div>
        ) : (
          <LeafletMap
            terrains={filteredTerrains}
            center={[14.7167, -17.4677]}
            zoom={12}
            onTerrainClick={handleTerrainClick}
            showUserLocation={true}
          />
        )}
      </div>

      {/* Détails terrain sélectionné */}
      {selectedTerrain && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '320px',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          padding: '20px',
          zIndex: 2000,
        }}>
          <button
            onClick={() => setSelectedTerrain(null)}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#9ca3af',
            }}
          >
            ×
          </button>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>
            {selectedTerrain.nom}
          </h3>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
            📍 {selectedTerrain.adresse}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Prix/heure</p>
              <p style={{ fontSize: '16px', fontWeight: 'bold' }}>{selectedTerrain.prix_heure} FCFA</p>
            </div>
            <div>
              <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Capacité</p>
              <p style={{ fontSize: '16px', fontWeight: 'bold' }}>{selectedTerrain.capacite} pers.</p>
            </div>
          </div>
          <button
            onClick={() => {
              window.location.href = `/terrain/${selectedTerrain.id}`;
            }}
            style={{
              width: '100%',
              padding: '12px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Voir les détails et réserver
          </button>
        </div>
      )}
    </div>
  );
};

export default MapPageNew;
