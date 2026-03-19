'use client'

export default function GerantHome() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Mes Terrains</h2>
        <p className="text-gray-600 mb-4">Gérez vos terrains synthétiques</p>
        <a 
          href="/gerant/terrains" 
          className="inline-block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Voir mes terrains
        </a>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Réservations</h2>
        <p className="text-gray-600 mb-4">Gérez les réservations de vos terrains</p>
        <a 
          href="/gerant/reservations" 
          className="inline-block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Voir les réservations
        </a>
      </div>
    </div>
  )
} 