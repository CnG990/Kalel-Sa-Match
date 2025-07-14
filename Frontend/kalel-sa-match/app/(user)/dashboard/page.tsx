'use client'

import { useState } from 'react'

export default function Dashboard() {
  const [upcomingBookings] = useState([
    {
      id: 1,
      fieldName: 'Terrain Synthétique Almadies',
      date: '2024-03-20',
      time: '18:00 - 19:00',
      status: 'confirmed',
      price: 15000,
    },
    {
      id: 2,
      fieldName: 'Terrain Synthétique Point E',
      date: '2024-03-22',
      time: '20:00 - 21:00',
      status: 'pending',
      price: 12000,
    },
  ])

  const [recentFields] = useState([
    {
      id: 1,
      name: 'Terrain Synthétique Almadies',
      location: 'Almadies, Dakar',
      rating: 4.5,
      price: 15000,
      image: '/images/hero-bg.jpg',
    },
    {
      id: 2,
      name: 'Terrain Synthétique Point E',
      location: 'Point E, Dakar',
      rating: 4.8,
      price: 12000,
      image: '/images/hero-bg.jpg',
    },
  ])

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-3xl">📅</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Réservations à venir
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">2</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-3xl">⚽</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Matchs joués
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">8</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-3xl">⭐</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Terrains favoris
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">3</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Bookings */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Réservations à venir
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <ul role="list" className="divide-y divide-gray-200">
            {upcomingBookings.map((booking) => (
              <li key={booking.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-kalel-primary truncate">
                      {booking.fieldName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {booking.date} • {booking.time}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      booking.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                    </span>
                    <span className="ml-4 text-sm font-medium text-gray-900">
                      {booking.price.toLocaleString()} FCFA
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recent Fields */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Terrains recommandés
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
            {recentFields.map((field) => (
              <div
                key={field.id}
                className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-kalel-primary"
              >
                <div className="flex-shrink-0">
                  <img
                    className="h-16 w-16 rounded-lg object-cover"
                    src={field.image}
                    alt={field.name}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <a href="#" className="focus:outline-none">
                    <p className="text-sm font-medium text-gray-900">{field.name}</p>
                    <p className="text-sm text-gray-500">{field.location}</p>
                    <div className="mt-1 flex items-center">
                      <span className="text-yellow-400">⭐</span>
                      <span className="ml-1 text-sm text-gray-500">{field.rating}</span>
                      <span className="ml-4 text-sm font-medium text-kalel-primary">
                        {field.price.toLocaleString()} FCFA/h
                      </span>
                    </div>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 