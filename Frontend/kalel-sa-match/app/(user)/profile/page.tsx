'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function Profile() {
  const [user] = useState({
    firstName: 'Moussa',
    lastName: 'Diop',
    email: 'moussa.diop@example.com',
    phone: '+221 78 594 92 74',
    avatar: '/images/avatar-placeholder.png',
  })

  const [stats] = useState({
    totalBookings: 12,
    favoriteFields: 3,
    totalSpent: 156000,
  })

  const [favoriteFields] = useState([
    {
      id: 1,
      name: 'Terrain Synthétique Almadies',
      location: 'Almadies, Dakar',
      rating: 4.5,
      bookings: 5,
    },
    {
      id: 2,
      name: 'Terrain Synthétique Point E',
      location: 'Point E, Dakar',
      rating: 4.8,
      bookings: 4,
    },
  ])

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-24 w-24 relative">
              <Image
                src={user.avatar}
                alt={`${user.firstName} ${user.lastName}`}
                fill
                className="rounded-full object-cover"
              />
            </div>
            <div className="ml-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {user.firstName} {user.lastName}
              </h2>
              <div className="mt-1 text-sm text-gray-500">
                <p>{user.email}</p>
                <p>{user.phone}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-3xl">📅</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total des réservations
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
                <span className="text-3xl">⭐</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Terrains favoris
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.favoriteFields}
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
                    Total dépensé
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalSpent.toLocaleString()} FCFA
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Settings */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Paramètres du compte
          </h3>
          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                Prénom
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  defaultValue={user.firstName}
                  className="shadow-sm focus:ring-kalel-primary focus:border-kalel-primary block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Nom
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  defaultValue={user.lastName}
                  className="shadow-sm focus:ring-kalel-primary focus:border-kalel-primary block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  name="email"
                  id="email"
                  defaultValue={user.email}
                  className="shadow-sm focus:ring-kalel-primary focus:border-kalel-primary block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Téléphone
              </label>
              <div className="mt-1">
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  defaultValue={user.phone}
                  className="shadow-sm focus:ring-kalel-primary focus:border-kalel-primary block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-kalel-primary hover:bg-kalel-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kalel-primary"
            >
              Sauvegarder les modifications
            </button>
          </div>
        </div>
      </div>

      {/* Favorite Fields */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Terrains favoris
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {favoriteFields.map((field) => (
              <div
                key={field.id}
                className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-kalel-primary"
              >
                <div className="flex-1 min-w-0">
                  <a href="#" className="focus:outline-none">
                    <p className="text-sm font-medium text-gray-900">{field.name}</p>
                    <p className="text-sm text-gray-500">{field.location}</p>
                    <div className="mt-1 flex items-center">
                      <span className="text-yellow-400">⭐</span>
                      <span className="ml-1 text-sm text-gray-500">{field.rating}</span>
                      <span className="ml-4 text-sm text-kalel-primary">
                        {field.bookings} réservations
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