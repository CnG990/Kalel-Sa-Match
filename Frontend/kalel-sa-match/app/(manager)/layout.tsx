'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const pathname = usePathname()

  const navigation = [
    { name: 'Tableau de bord', href: '/manager/dashboard', icon: '📊' },
    { name: 'Mes terrains', href: '/manager/fields', icon: '⚽' },
    { name: 'Réservations', href: '/manager/bookings', icon: '📅' },
    { name: 'Calendrier', href: '/manager/calendar', icon: '📆' },
    { name: 'Statistiques', href: '/manager/stats', icon: '📈' },
    { name: 'Paramètres', href: '/manager/settings', icon: '⚙️' },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar for desktop */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-center h-16 px-4 bg-kalel-primary">
            <div className="flex items-center">
              <Image
                src="/images/logo.png"
                alt="Kalèl sa Match"
                width={40}
                height={40}
                className="object-contain"
              />
              <div className="ml-2 flex flex-col text-white">
                <span className="text-sm font-semibold">Kalèl sa</span>
                <span className="text-xs">Match</span>
              </div>
            </div>
          </div>
          <nav className="flex-1 px-4 space-y-1 mt-5">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    isActive
                      ? 'bg-kalel-primary text-white'
                      : 'text-gray-600 hover:bg-kalel-primary/10'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              )
            })}
          </nav>
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => {/* TODO: Implement logout */}}
              className="flex items-center w-full px-2 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50"
            >
              <span className="mr-3">🚪</span>
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={`flex-1 ${isSidebarOpen ? 'lg:pl-64' : ''}`}>
        <div className="sticky top-0 z-10 flex items-center justify-between h-16 bg-white shadow-sm px-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <span className="sr-only">Open sidebar</span>
            {isSidebarOpen ? '✕' : '☰'}
          </button>
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-gray-900">
                {navigation.find(item => item.href === pathname)?.name || 'Tableau de bord'}
              </h1>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none">
                <span className="sr-only">View notifications</span>
                🔔
              </button>
              <div className="ml-3 relative">
                <div>
                  <button className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none">
                    <span className="sr-only">Open user menu</span>
                    👤
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
} 