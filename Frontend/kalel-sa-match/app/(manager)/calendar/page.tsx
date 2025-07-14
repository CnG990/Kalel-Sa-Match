'use client'

import { useState } from 'react'

export default function ManagerCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedField, setSelectedField] = useState('all')

  const [fields] = useState([
    { id: 'field1', name: 'Terrain Principal' },
    { id: 'field2', name: 'Terrain Couvert' },
    { id: 'field3', name: 'Terrain Annexe' },
  ])

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
    '20:00', '21:00', '22:00'
  ]

  const [bookings] = useState([
    {
      id: 1,
      fieldId: 'field1',
      date: '2024-03-20',
      startTime: '18:00',
      endTime: '19:00',
      customerName: 'Abdou Diallo',
      status: 'confirmed',
    },
    {
      id: 2,
      fieldId: 'field2',
      date: '2024-03-20',
      startTime: '19:00',
      endTime: '20:00',
      customerName: 'Fatou Sow',
      status: 'pending',
    },
  ])

  const getBookingForSlot = (fieldId: string, time: string) => {
    return bookings.find(
      booking =>
        booking.fieldId === fieldId &&
        booking.date === selectedDate &&
        booking.startTime === time
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-kalel-primary focus:ring-kalel-primary sm:text-sm"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
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

      {/* Calendar Grid */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="min-w-full divide-y divide-gray-200">
          <div className="bg-gray-50">
            <div className="grid grid-cols-[100px_repeat(auto-fill,minmax(120px,1fr))] gap-px bg-gray-200">
              <div className="bg-gray-50 p-3">
                <span className="text-xs font-medium text-gray-500">Horaire</span>
              </div>
              {fields
                .filter((field) => selectedField === 'all' || field.id === selectedField)
                .map((field) => (
                  <div key={field.id} className="bg-gray-50 p-3">
                    <span className="text-xs font-medium text-gray-500">
                      {field.name}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {timeSlots.map((time) => (
              <div
                key={time}
                className="grid grid-cols-[100px_repeat(auto-fill,minmax(120px,1fr))] gap-px bg-gray-200"
              >
                <div className="bg-white p-3">
                  <span className="text-sm text-gray-900">{time}</span>
                </div>
                {fields
                  .filter((field) => selectedField === 'all' || field.id === selectedField)
                  .map((field) => {
                    const booking = getBookingForSlot(field.id, time)
                    return (
                      <div key={`${field.id}-${time}`} className="bg-white p-2">
                        {booking ? (
                          <div
                            className={`rounded-md border p-2 text-xs ${getStatusColor(
                              booking.status
                            )}`}
                          >
                            <p className="font-medium truncate">
                              {booking.customerName}
                            </p>
                            <p className="truncate">
                              {booking.startTime} - {booking.endTime}
                            </p>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="w-full h-full rounded-md border-2 border-dashed border-gray-200 p-2 text-center text-xs text-gray-400 hover:border-kalel-primary hover:text-kalel-primary"
                          >
                            Disponible
                          </button>
                        )}
                      </div>
                    )
                  })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 