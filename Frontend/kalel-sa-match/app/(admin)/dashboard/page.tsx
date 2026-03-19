'use client'

import { useState } from 'react'

export default function AdminDashboard() {
  const [stats] = useState({
    totalUsers: 1250,
    totalFields: 13,
    totalBookings: 3456,
    totalRevenue: 51840000,
    activeUsers: 890,
    newUsersThisMonth: 45,
    fields: [
      {
        id: 1,
        name: 'Complexe Be Sport',
        bookings: 456,
        revenue: 6840000,
        rating: 4.5,
      },
      {
        id: 2,
        name: 'Fara Foot',
        bookings: 389,
        revenue: 5835000,
        rating: 4.3,
      },
      {
        id: 3,
        name: 'Fit Park Academy',
        bookings: 345,
        revenue: 5175000,
        rating: 4.7,
      },
      {
        id: 4,
        name: 'Skate Parc',
        bookings: 234,
        revenue: 3510000,
        rating: 4.2,
      },
      {
        id: 5,
        name: 'Sowfoot',
        bookings: 321,
        revenue: 4815000,
        rating: 4.6,
      },
    ],
    recentBookings: [
      {
        id: 1,
        customerName: 'Abdou Diallo',
        fieldName: 'Complexe Be Sport',
        date: '2024-03-20',
        time: '18:00 - 19:00',
        status: 'confirmed',
        price: 15000,
      },
      {
        id: 2,
        customerName: 'Fatou Sow',
        fieldName: 'Fara Foot',
        date: '2024-03-20',
        time: '19:00 - 20:00',
        status: 'pending',
        price: 12000,
      },
    ],
    recentReviews: [
      {
        id: 1,
        customerName: 'Abdou Diallo',
        fieldName: 'Complexe Be Sport',
        rating: 5,
        comment: 'Excellent terrain, très bien entretenu !',
        date: '2024-03-19',
      },
      {
        id: 2,
        customerName: 'Fatou Sow',
        fieldName: 'Fara Foot',
        rating: 4,
        comment: 'Bon terrain, mais les vestiaires pourraient être plus propres.',
        date: '2024-03-18',
      },
    ],
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmé'
      case 'pending':
        return 'En attente'
      case 'completed':
        return 'Terminé'
      case 'cancelled':
        return 'Annulé'
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-3xl">👥</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Utilisateurs totaux
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalUsers}
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
                    Terrains totaux
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalFields}
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
      </div>

      {/* Top Fields */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Top 5 des terrains
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <div className="divide-y divide-gray-200">
            {stats.fields.map((field) => (
              <div key={field.id} className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900">
                    {field.name}
                  </h4>
                  <div className="flex items-center">
                    <span className="text-yellow-400">⭐</span>
                    <span className="ml-1 text-sm text-gray-500">
                      {field.rating}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-gray-500">Réservations</p>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {field.bookings}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Revenus</p>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {field.revenue.toLocaleString()} FCFA
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Recent Bookings */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Réservations récentes
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <ul role="list" className="divide-y divide-gray-200">
              {stats.recentBookings.map((booking) => (
                <li key={booking.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-kalel-primary">
                          {booking.customerName}
                        </p>
                        <p className="ml-2 text-sm text-gray-500">
                          • {booking.fieldName}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500">
                        {booking.date} • {booking.time}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {getStatusText(booking.status)}
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

        {/* Recent Reviews */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Avis récents
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <ul role="list" className="divide-y divide-gray-200">
              {stats.recentReviews.map((review) => (
                <li key={review.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-kalel-primary">
                          {review.customerName}
                        </p>
                        <p className="ml-2 text-sm text-gray-500">
                          • {review.fieldName}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500">{review.date}</p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-yellow-400">⭐</span>
                      <span className="ml-1 text-sm text-gray-500">
                        {review.rating}
                      </span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">{review.comment}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 