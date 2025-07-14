'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function ManagerDashboard() {
  const [stats] = useState({
    totalBookings: 156,
    totalRevenue: 2340000,
    averageRating: 4.5,
    activeFields: 3,
  })

  const [recentBookings] = useState([
    {
      id: 1,
      customerName: 'Abdou Diallo',
      fieldName: 'Terrain Principal',
      date: '2024-03-20',
      time: '18:00 - 19:00',
      status: 'confirmed',
      price: 15000,
      paymentStatus: 'paid',
    },
    {
      id: 2,
      customerName: 'Fatou Sow',
      fieldName: 'Terrain Couvert',
      date: '2024-03-20',
      time: '19:00 - 20:00',
      status: 'pending',
      price: 12000,
      paymentStatus: 'pending',
    },
  ])

  const [popularTimeSlots] = useState([
    { time: '18:00 - 19:00', bookings: 45 },
    { time: '19:00 - 20:00', bookings: 42 },
    { time: '20:00 - 21:00', bookings: 38 },
    { time: '17:00 - 18:00', bookings: 35 },
  ])

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-3xl">📅</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Réservations totales
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalBookings}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-3xl">💰</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Revenus totaux
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalRevenue.toLocaleString()} FCFA
                  </dd>
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
                    Note moyenne
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.averageRating}/5
                  </dd>
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
                    Terrains actifs
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.activeFields}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Réservations récentes
          </h3>
          <a
            href="/manager/bookings"
            className="text-sm font-medium text-kalel-primary hover:text-kalel-secondary"
          >
            Voir tout →
          </a>
        </div>
        <div className="border-t border-gray-200">
          <ul role="list" className="divide-y divide-gray-200">
            {recentBookings.map((booking) => (
              <li key={booking.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-kalel-primary">
                      {booking.customerName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {booking.fieldName} • {booking.date} • {booking.time}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        booking.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {booking.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                    </span>
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        booking.paymentStatus === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {booking.paymentStatus === 'paid' ? 'Payé' : 'En attente'}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {booking.price.toLocaleString()} FCFA
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Popular Time Slots */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Créneaux les plus populaires
          </h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {popularTimeSlots.map((slot, index) => (
              <div
                key={slot.time}
                className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm"
              >
                <div className="flex-shrink-0">
                  <span className="text-2xl">{index + 1}.</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">{slot.time}</p>
                  <p className="text-sm text-gray-500">{slot.bookings} réservations</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 