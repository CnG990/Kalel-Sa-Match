'use client'

export default function AdminHome() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Terrains</h2>
        <p className="text-gray-600 mb-4">Gérez les terrains synthétiques</p>
        <a 
          href="/admin/terrains" 
          className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Voir les terrains
        </a>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Gérants</h2>
        <p className="text-gray-600 mb-4">Gérez les gérants des terrains</p>
        <a 
          href="/admin/gerants" 
          className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Voir les gérants
        </a>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Réservations</h2>
        <p className="text-gray-600 mb-4">Suivez les réservations</p>
        <a 
          href="/admin/reservations" 
          className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Voir les réservations
        </a>
      </div>
    </div>
  )
} 