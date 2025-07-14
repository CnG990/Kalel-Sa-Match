'use client'

import { useState } from 'react'

export default function ManagerBookings() {
  const [activeTab, setActiveTab] = useState('pending')
  const [bookings] = useState({
    pending: [
      {
        id: 1,
        customerName: 'Fatou Sow',
        customerPhone: '+221 77 123 45 67',
        fieldName: 'Terrain Couvert',
        date: '2024-03-20',
        time: '19:00 - 20:00',
        status: 'pending',
        price: 12000,
        paymentStatus: 'pending',
      },
      {
        id: 2,
        customerName: 'Moussa Diallo',
        customerPhone: '+221 76 234 56 78',
        fieldName: 'Terrain Principal',
        date: '2024-03-21',
        time: '18:00 - 19:00',
        status: 'pending',
        price: 15000,
        paymentStatus: 'pending',
      },
    ],
    confirmed: [
      {
        id: 3,
        customerName: 'Abdou Diallo',
        customerPhone: '+221 78 345 67 89',
        fieldName: 'Terrain Principal',
        date: '2024-03-20',
        time: '18:00 - 19:00',
        status: 'confirmed',
        price: 15000,
        paymentStatus: 'paid',
      },
    ],
    completed: [
      {
        id: 4,
        customerName: 'Aminata Sall',
        customerPhone: '+221 77 456 78 90',
        fieldName: 'Terrain Principal',
        date: '2024-03-19',
        time: '17:00 - 18:00',
        status: 'completed',
        price: 15000,
        paymentStatus: 'paid',
      },
    ],
    cancelled: [
      {
        id: 5,
        customerName: 'Omar Sy',
        customerPhone: '+221 76 567 89 01',
        fieldName: 'Terrain Annexe',
        date: '2024-03-18',
        time: '16:00 - 17:00',
        status: 'cancelled',
        price: 10000,
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
          {['pending', 'confirmed', 'completed', 'cancelled'].map((tab) => (
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
              {tab === 'pending' && 'En attente'}
              {tab === 'confirmed' && 'Confirmées'}
              {tab === 'completed' && 'Terminées'}
              {tab === 'cancelled' && 'Annulées'}
            </button>
          ))}
        </nav>
      </div>

      {/* Bookings List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <ul role="list" className="divide-y divide-gray-200">
          {bookings[activeTab as keyof typeof bookings].map((booking) => (
            <li key={booking.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-kalel-primary">
                      {booking.customerName}
                    </p>
                    <p className="ml-2 text-sm text-gray-500">
                      ({booking.customerPhone})
                    </p>
                  </div>
                  <p className="text-sm text-gray-500">
                    {booking.fieldName} • {booking.date} • {booking.time}
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

              {booking.status === 'pending' && (
                <div className="mt-4 flex justify-end space-x-4">
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-white bg-kalel-primary hover:bg-kalel-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kalel-primary"
                  >
                    Confirmer
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Refuser
                  </button>
                </div>
              )}

              {booking.status === 'confirmed' && (
                <div className="mt-4 flex justify-end space-x-4">
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-white bg-kalel-primary hover:bg-kalel-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kalel-primary"
                  >
                    Marquer comme terminé
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Annuler
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
} 