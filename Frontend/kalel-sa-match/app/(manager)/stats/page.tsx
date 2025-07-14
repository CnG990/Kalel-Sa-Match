'use client'

import { useState } from 'react'

export default function ManagerStats() {
  const [period, setPeriod] = useState('month')
  const [selectedField, setSelectedField] = useState('all')

  const [fields] = useState([
    { id: 'field1', name: 'Terrain Principal' },
    { id: 'field2', name: 'Terrain Couvert' },
    { id: 'field3', name: 'Terrain Annexe' },
  ])

  const [stats] = useState({
    totalBookings: 156,
    totalRevenue: 2340000,
    averageRating: 4.5,
    occupancyRate: 75,
    popularHours: [
      { hour: '18:00', bookings: 45 },
      { hour: '19:00', bookings: 42 },
      { hour: '20:00', bookings: 38 },
      { hour: '17:00', bookings: 35 },
    ],
    fieldStats: [
      {
        fieldId: 'field1',
        bookings: 89,
        revenue: 1335000,
        rating: 4.5,
        occupancyRate: 80,
      },
      {
        fieldId: 'field2',
        bookings: 45,
        revenue: 540000,
        rating: 4.8,
        occupancyRate: 70,
      },
      {
        fieldId: 'field3',
        bookings: 22,
        revenue: 220000,
        rating: 4.2,
        occupancyRate: 50,
      },
    ],
    recentReviews: [
      {
        id: 1,
        customerName: 'Abdou Diallo',
        fieldId: 'field1',
        rating: 5,
        comment: 'Excellent terrain, très bien entretenu !',
        date: '2024-03-19',
      },
      {
        id: 2,
        customerName: 'Fatou Sow',
        fieldId: 'field2',
        rating: 4,
        comment: 'Bon terrain, mais les vestiaires pourraient être plus propres.',
        date: '2024-03-18',
      },
    ],
  })

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="period" className="block text-sm font-medium text-gray-700">
              Période
            </label>
            <select
              id="period"
              name="period"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-kalel-primary focus:ring-kalel-primary sm:text-sm"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="year">Cette année</option>
            </select>
          </div>
          <div>
            <label htmlFor="field" className="block text-sm font-medium text-gray-700">
              Terrain
            </label>
            <select
              id="field"
              name="field"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-kalel-primary focus:ring-kalel-primary sm:text-sm"
              value={selectedField}
              onChange={(e) => setSelectedField(e.target.value)}
            >
              <option value="all">Tous les terrains</option>
              {fields.map((field) => (
                <option key={field.id} value={field.id}>
                  {field.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Global Stats */}
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
                <span className="text-3xl">📊</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Taux d'occupation
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.occupancyRate}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Hours */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Heures les plus populaires
          </h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {stats.popularHours.map((slot, index) => (
              <div
                key={slot.hour}
                className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm"
              >
                <div className="flex-shrink-0">
                  <span className="text-2xl">{index + 1}.</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">{slot.hour}</p>
                  <p className="text-sm text-gray-500">{slot.bookings} réservations</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Field Stats */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Statistiques par terrain
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <div className="divide-y divide-gray-200">
            {stats.fieldStats.map((fieldStat) => {
              const field = fields.find((f) => f.id === fieldStat.fieldId)
              return (
                <div key={fieldStat.fieldId} className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-gray-900">
                      {field?.name}
                    </h4>
                    <div className="flex items-center">
                      <span className="text-yellow-400">⭐</span>
                      <span className="ml-1 text-sm text-gray-500">
                        {fieldStat.rating}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <p className="text-sm text-gray-500">Réservations</p>
                      <p className="mt-1 text-lg font-semibold text-gray-900">
                        {fieldStat.bookings}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Revenus</p>
                      <p className="mt-1 text-lg font-semibold text-gray-900">
                        {fieldStat.revenue.toLocaleString()} FCFA
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Taux d'occupation</p>
                      <p className="mt-1 text-lg font-semibold text-gray-900">
                        {fieldStat.occupancyRate}%
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
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
            {stats.recentReviews.map((review) => {
              const field = fields.find((f) => f.id === review.fieldId)
              return (
                <li key={review.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-kalel-primary">
                          {review.customerName}
                        </p>
                        <p className="ml-2 text-sm text-gray-500">
                          • {field?.name}
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
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
} 