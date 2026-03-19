'use client'

export default function GerantLayout({
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
              <a href="/gerant" className="text-xl font-semibold hover:text-green-600">Espace Gérant</a>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/gerant/terrains" className="text-gray-700 hover:text-green-600">Mes Terrains</a>
              <a href="/gerant/reservations" className="text-gray-700 hover:text-green-600">Réservations</a>
              <a href="/" className="text-gray-700 hover:text-green-600">Retour à l'accueil</a>
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