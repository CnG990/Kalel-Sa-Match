'use client'

export default function ClientHome() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Terrains disponibles</h2>
        <p className="text-gray-600 mb-4">Trouvez et réservez un terrain synthétique</p>
        <a 
          href="/client/terrains" 
          className="inline-block bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
        >
          Voir les terrains
        </a>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Mes réservations</h2>
        <p className="text-gray-600 mb-4">Consultez et gérez vos réservations</p>
        <a 
          href="/client/reservations" 
          className="inline-block bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
        >
          Voir mes réservations
        </a>
      </div>
    </div>
  )
} 