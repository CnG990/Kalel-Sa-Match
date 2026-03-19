'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function Book() {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [fields] = useState([
    {
      id: 1,
      name: 'Complexe Be Sport',
      location: 'Dakar',
      rating: 4.5,
      price: 15000,
      image: '/images/hero-bg.jpg',
      description: 'Complexe sportif moderne avec terrains synthétiques de qualité.',
      amenities: ['Vestiaires', 'Douches', 'Parking', 'Éclairage LED', 'Ballon fourni'],
    },
    {
      id: 2,
      name: 'Fara Foot',
      location: 'Dakar',
      rating: 4.3,
      price: 12000,
      image: '/images/hero-bg.jpg',
      description: 'Terrain de foot avec une excellente surface de jeu.',
      amenities: ['Vestiaires', 'Parking', 'Éclairage', 'Ballon fourni'],
    },
    {
      id: 3,
      name: 'Fit Park Academy',
      location: 'Dakar',
      rating: 4.7,
      price: 18000,
      image: '/images/hero-bg.jpg',
      description: 'Centre sportif moderne avec installations haut de gamme.',
      amenities: ['Vestiaires', 'Douches', 'Parking', 'Éclairage LED', 'Wifi', 'Cafétéria'],
    },
    {
      id: 4,
      name: 'Skate Parc',
      location: 'Dakar',
      rating: 4.2,
      price: 10000,
      image: '/images/hero-bg.jpg',
      description: 'Terrain polyvalent adapté au football.',
      amenities: ['Parking', 'Éclairage', 'Point d\'eau'],
    },
    {
      id: 5,
      name: 'Sowfoot',
      location: 'Dakar',
      rating: 4.6,
      price: 15000,
      image: '/images/hero-bg.jpg',
      description: 'Terrain synthétique de qualité professionnelle.',
      amenities: ['Vestiaires', 'Douches', 'Parking', 'Éclairage LED'],
    },
    {
      id: 6,
      name: 'Stade Deggo',
      location: 'Dakar',
      rating: 4.4,
      price: 13000,
      image: '/images/hero-bg.jpg',
      description: 'Stade historique avec terrain bien entretenu.',
      amenities: ['Vestiaires', 'Parking', 'Éclairage', 'Gradins'],
    },
    {
      id: 7,
      name: 'Stade Demba Diop',
      location: 'Dakar',
      rating: 4.8,
      price: 20000,
      image: '/images/hero-bg.jpg',
      description: 'Stade emblématique avec excellentes installations.',
      amenities: ['Vestiaires', 'Douches', 'Parking', 'Éclairage professionnel', 'Gradins'],
    },
    {
      id: 8,
      name: 'Stade Iba Mar Diop',
      location: 'Dakar',
      rating: 4.7,
      price: 18000,
      image: '/images/hero-bg.jpg',
      description: 'Stade mythique avec terrain de qualité.',
      amenities: ['Vestiaires', 'Douches', 'Parking', 'Éclairage', 'Gradins'],
    },
    {
      id: 9,
      name: 'TEMPLE DU FOOT DAKAR',
      location: 'Dakar',
      rating: 4.9,
      price: 25000,
      image: '/images/hero-bg.jpg',
      description: 'Centre sportif complet avec Foot, Padel et Sport Bar.',
      amenities: ['Vestiaires', 'Douches', 'Parking', 'Bar', 'Restaurant', 'Wifi'],
    },
    {
      id: 10,
      name: 'Premier Projets Aréna',
      location: 'Dakar',
      rating: 4.6,
      price: 15000,
      image: '/images/hero-bg.jpg',
      description: 'Terrain mini foot moderne et confortable.',
      amenities: ['Vestiaires', 'Douches', 'Parking', 'Éclairage LED'],
    },
    {
      id: 11,
      name: 'TENNIS Mini Foot Squash',
      location: 'Dakar',
      rating: 4.5,
      price: 16000,
      image: '/images/hero-bg.jpg',
      description: 'Complex multisport avec terrain de mini foot.',
      amenities: ['Vestiaires', 'Douches', 'Parking', 'Éclairage', 'Tennis', 'Squash'],
    },
    {
      id: 12,
      name: 'Terrain Diaraf',
      location: 'Dakar',
      rating: 4.4,
      price: 14000,
      image: '/images/hero-bg.jpg',
      description: 'Terrain historique du club de Diaraf.',
      amenities: ['Vestiaires', 'Parking', 'Éclairage', 'Gradins'],
    },
    {
      id: 13,
      name: 'Terrain ASC Liberté 6',
      location: 'Dakar',
      rating: 4.3,
      price: 12000,
      image: '/images/hero-bg.jpg',
      description: 'Terrain communautaire bien entretenu.',
      amenities: ['Vestiaires', 'Parking', 'Éclairage'],
    },
  ])

  const timeSlots = [
    '08:00 - 09:00',
    '09:00 - 10:00',
    '10:00 - 11:00',
    '11:00 - 12:00',
    '12:00 - 13:00',
    '13:00 - 14:00',
    '14:00 - 15:00',
    '15:00 - 16:00',
    '16:00 - 17:00',
    '17:00 - 18:00',
    '18:00 - 19:00',
    '19:00 - 20:00',
    '20:00 - 21:00',
    '21:00 - 22:00',
  ]

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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
            <label htmlFor="time" className="block text-sm font-medium text-gray-700">
              Heure
            </label>
            <select
              id="time"
              name="time"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-kalel-primary focus:ring-kalel-primary sm:text-sm"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
            >
              <option value="">Sélectionnez une heure</option>
              {timeSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Quartier
            </label>
            <select
              id="location"
              name="location"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-kalel-primary focus:ring-kalel-primary sm:text-sm"
            >
              <option value="">Tous les quartiers</option>
              <option value="almadies">Almadies</option>
              <option value="point-e">Point E</option>
              <option value="mermoz">Mermoz</option>
              <option value="ouakam">Ouakam</option>
            </select>
          </div>
        </div>
      </div>

      {/* Fields List */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {fields.map((field) => (
          <div key={field.id} className="bg-white shadow rounded-lg overflow-hidden">
            <div className="relative h-48">
              <Image
                src={field.image}
                alt={field.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{field.name}</h3>
                  <p className="text-sm text-gray-500">{field.location}</p>
                </div>
                <div className="flex items-center">
                  <span className="text-yellow-400">⭐</span>
                  <span className="ml-1 text-sm text-gray-500">{field.rating}</span>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-600">{field.description}</p>
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900">Équipements</h4>
                <div className="mt-2 flex flex-wrap gap-2">
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
              <div className="mt-6 flex items-center justify-between">
                <span className="text-2xl font-bold text-kalel-primary">
                  {field.price.toLocaleString()} FCFA/h
                </span>
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-kalel-primary hover:bg-kalel-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kalel-primary"
                >
                  Réserver
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 