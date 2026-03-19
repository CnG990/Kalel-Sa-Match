'use client'

import { useState } from 'react'

export default function Bookings() {
  const [activeTab, setActiveTab] = useState('upcoming')
  const [bookings] = useState({
    upcoming: [
      {
        id: 1,
        fieldName: 'Terrain Synthétique Almadies',
        date: '2024-03-20',
        time: '18:00 - 19:00',
        status: 'confirmed',
        price: 15000,
        paymentStatus: 'paid',
      },
      {
        id: 2,
        fieldName: 'Terrain Synthétique Point E',
        date: '2024-03-22',
        time: '20:00 - 21:00',
        status: 'pending',
        price: 12000,
        paymentStatus: 'pending',
      },
    ],
    past: [
      {
        id: 3,
        fieldName: 'Terrain Synthétique Almadies',
        date: '2024-03-15',
        time: '19:00 - 20:00',
        status: 'completed',
        price: 15000,
        paymentStatus: 'paid',
      },
      {
        id: 4,
        fieldName: 'Terrain Synthétique Point E',
        date: '2024-03-10',
        time: '17:00 - 18:00',
        status: 'completed',
        price: 12000,
        paymentStatus: 'paid',
      },
    ],
    cancelled: [
      {
        id: 5,
        fieldName: 'Terrain Synthétique Mermoz',
        date: '2024-03-18',
        time: '16:00 - 17:00',
        status: 'cancelled',
        price: 13000,
        paymentStatus: 'refunded',
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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'refunded':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Payé'
      case 'pending':
        return 'En attente'
      case 'refunded':
        return 'Remboursé'
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {['upcoming', 'past', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${
                  activeTab === tab
                    ? 'border-kalel-primary text-kalel-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab === 'upcoming' && 'À venir'}
              {tab === 'past' && 'Passées'}
              {tab === 'cancelled' && 'Annulées'}
            </button>
          ))}
        </nav>
      </div>

      {/* Bookings List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          {bookings[activeTab as keyof typeof bookings].map((booking) => (
            <li key={booking.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-kalel-primary truncate">
                      {booking.fieldName}
                    </p>
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
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(
                        booking.paymentStatus
                      )}`}
                    >
                      {getPaymentStatusText(booking.paymentStatus)}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {booking.price.toLocaleString()} FCFA
                    </span>
                  </div>
                </div>
                {booking.status === 'confirmed' && (
                  <div className="mt-4 flex justify-end space-x-4">
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-white bg-kalel-primary hover:bg-kalel-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kalel-primary"
                    >
                      Voir le reçu
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Annuler
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
} 