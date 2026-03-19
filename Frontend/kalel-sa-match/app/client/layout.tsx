'use client'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <a href="/client" className="text-xl font-semibold hover:text-purple-600">Espace Client</a>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/client/terrains" className="text-gray-700 hover:text-purple-600">Terrains disponibles</a>
              <a href="/client/reservations" className="text-gray-700 hover:text-purple-600">Mes réservations</a>
              <a href="/" className="text-gray-700 hover:text-purple-600">Retour à l'accueil</a>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 px-4">
        {children}
      </main>
    </div>
  )
} 