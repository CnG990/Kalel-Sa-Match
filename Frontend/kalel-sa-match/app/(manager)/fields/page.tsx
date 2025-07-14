'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function ManagerFields() {
  const [fields] = useState([
    {
      id: 1,
      name: 'Terrain Principal',
      status: 'active',
      price: 15000,
      image: '/images/hero-bg.jpg',
      description: 'Terrain synthétique de dernière génération',
      amenities: ['Vestiaires', 'Douches', 'Parking', 'Éclairage LED'],
      rating: 4.5,
      totalBookings: 89,
    },
    {
      id: 2,
      name: 'Terrain Couvert',
      status: 'active',
      price: 12000,
      image: '/images/hero-bg.jpg',
      description: 'Terrain couvert idéal pour jouer en toute saison',
      amenities: ['Vestiaires', 'Parking', 'Éclairage', 'Wifi'],
      rating: 4.8,
      totalBookings: 45,
    },
    {
      id: 3,
      name: 'Terrain Annexe',
      status: 'maintenance',
      price: 10000,
      image: '/images/hero-bg.jpg',
      description: 'Terrain secondaire pour l\'entraînement',
      amenities: ['Parking', 'Éclairage'],
      rating: 4.2,
      totalBookings: 22,
    },
  ])

  return (
    <div className="space-y-6">
      {/* Header with Add Field Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Mes terrains</h2>
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-kalel-primary hover:bg-kalel-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kalel-primary"
        >
          <span className="mr-2">➕</span>
          Ajouter un terrain
        </button>
      </div>

      {/* Fields Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {fields.map((field) => (
          <div
            key={field.id}
            className="bg-white shadow rounded-lg overflow-hidden"
          >
            <div className="relative h-48">
              <Image
                src={field.image}
                alt={field.name}
                fill
                className="object-cover"
              />
              <div className="absolute top-2 right-2">
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    field.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {field.status === 'active' ? 'Actif' : 'En maintenance'}
                </span>
              </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{field.name}</h3>
                  <p className="text-sm text-gray-500">{field.description}</p>
                </div>
                <div className="flex items-center">
                  <span className="text-yellow-400">⭐</span>
                  <span className="ml-1 text-sm text-gray-500">{field.rating}</span>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Équipements</h4>
                <div className="flex flex-wrap gap-2">
                  {field.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-kalel-primary/10 text-kalel-primary"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-kalel-primary">
                  {field.price.toLocaleString()} FCFA/h
                </span>
                <span className="text-sm text-gray-500">
                  {field.totalBookings} réservations
                </span>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-kalel-primary hover:bg-kalel-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kalel-primary"
                >
                  Modifier
                </button>
                <button
                  type="button"
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kalel-primary"
                >
                  {field.status === 'active' ? 'Désactiver' : 'Activer'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 