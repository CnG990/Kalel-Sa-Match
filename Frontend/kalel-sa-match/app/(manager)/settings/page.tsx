'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function ManagerSettings() {
  const [manager] = useState({
    firstName: 'Moussa',
    lastName: 'Diop',
    email: 'moussa.diop@example.com',
    phone: '+221 78 594 92 74',
    companyName: 'Complexe Sportif Dakar',
    address: 'Rue 10, Dakar, Sénégal',
    avatar: '/images/avatar-placeholder.png',
  })

  const [notifications] = useState({
    email: true,
    sms: true,
    newBooking: true,
    bookingCancellation: true,
    reviews: true,
    dailyReport: false,
    weeklyReport: true,
    monthlyReport: true,
  })

  return (
    <div className="space-y-6">
      {/* Profile Settings */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Informations du profil
          </h3>
          <div className="flex items-center mb-6">
            <div className="flex-shrink-0 h-24 w-24 relative">
              <Image
                src={manager.avatar}
                alt={`${manager.firstName} ${manager.lastName}`}
                fill
                className="rounded-full object-cover"
              />
            </div>
            <div className="ml-4">
              <button
                type="button"
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kalel-primary"
              >
                Changer la photo
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                Prénom
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  defaultValue={manager.firstName}
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
                  defaultValue={manager.lastName}
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
                  defaultValue={manager.email}
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
                  defaultValue={manager.phone}
                  className="shadow-sm focus:ring-kalel-primary focus:border-kalel-primary block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                Nom de l'établissement
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="companyName"
                  id="companyName"
                  defaultValue={manager.companyName}
                  className="shadow-sm focus:ring-kalel-primary focus:border-kalel-primary block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Adresse
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="address"
                  id="address"
                  defaultValue={manager.address}
                  className="shadow-sm focus:ring-kalel-primary focus:border-kalel-primary block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
          <button
            type="button"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-kalel-primary hover:bg-kalel-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kalel-primary"
          >
            Sauvegarder les modifications
          </button>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Paramètres de notification
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Notifications par email</h4>
                <p className="text-sm text-gray-500">Recevoir les notifications par email</p>
              </div>
              <button
                type="button"
                className={`${
                  notifications.email
                    ? 'bg-kalel-primary'
                    : 'bg-gray-200'
                } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kalel-primary`}
              >
                <span className="sr-only">Activer les notifications par email</span>
                <span
                  className={`${
                    notifications.email ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Notifications par SMS</h4>
                <p className="text-sm text-gray-500">Recevoir les notifications par SMS</p>
              </div>
              <button
                type="button"
                className={`${
                  notifications.sms
                    ? 'bg-kalel-primary'
                    : 'bg-gray-200'
                } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kalel-primary`}
              >
                <span className="sr-only">Activer les notifications par SMS</span>
                <span
                  className={`${
                    notifications.sms ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                />
              </button>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Types de notifications</h4>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">Nouvelles réservations</h5>
                    <p className="text-sm text-gray-500">Être notifié des nouvelles réservations</p>
                  </div>
                  <button
                    type="button"
                    className={`${
                      notifications.newBooking
                        ? 'bg-kalel-primary'
                        : 'bg-gray-200'
                    } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kalel-primary`}
                  >
                    <span className="sr-only">Activer les notifications de nouvelles réservations</span>
                    <span
                      className={`${
                        notifications.newBooking ? 'translate-x-5' : 'translate-x-0'
                      } pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">Annulations</h5>
                    <p className="text-sm text-gray-500">Être notifié des annulations de réservation</p>
                  </div>
                  <button
                    type="button"
                    className={`${
                      notifications.bookingCancellation
                        ? 'bg-kalel-primary'
                        : 'bg-gray-200'
                    } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kalel-primary`}
                  >
                    <span className="sr-only">Activer les notifications d'annulation</span>
                    <span
                      className={`${
                        notifications.bookingCancellation ? 'translate-x-5' : 'translate-x-0'
                      } pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">Nouveaux avis</h5>
                    <p className="text-sm text-gray-500">Être notifié des nouveaux avis clients</p>
                  </div>
                  <button
                    type="button"
                    className={`${
                      notifications.reviews
                        ? 'bg-kalel-primary'
                        : 'bg-gray-200'
                    } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kalel-primary`}
                  >
                    <span className="sr-only">Activer les notifications d'avis</span>
                    <span
                      className={`${
                        notifications.reviews ? 'translate-x-5' : 'translate-x-0'
                      } pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Rapports</h4>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">Rapport journalier</h5>
                    <p className="text-sm text-gray-500">Recevoir un résumé quotidien</p>
                  </div>
                  <button
                    type="button"
                    className={`${
                      notifications.dailyReport
                        ? 'bg-kalel-primary'
                        : 'bg-gray-200'
                    } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kalel-primary`}
                  >
                    <span className="sr-only">Activer le rapport journalier</span>
                    <span
                      className={`${
                        notifications.dailyReport ? 'translate-x-5' : 'translate-x-0'
                      } pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">Rapport hebdomadaire</h5>
                    <p className="text-sm text-gray-500">Recevoir un résumé hebdomadaire</p>
                  </div>
                  <button
                    type="button"
                    className={`${
                      notifications.weeklyReport
                        ? 'bg-kalel-primary'
                        : 'bg-gray-200'
                    } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kalel-primary`}
                  >
                    <span className="sr-only">Activer le rapport hebdomadaire</span>
                    <span
                      className={`${
                        notifications.weeklyReport ? 'translate-x-5' : 'translate-x-0'
                      } pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">Rapport mensuel</h5>
                    <p className="text-sm text-gray-500">Recevoir un résumé mensuel</p>
                  </div>
                  <button
                    type="button"
                    className={`${
                      notifications.monthlyReport
                        ? 'bg-kalel-primary'
                        : 'bg-gray-200'
                    } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kalel-primary`}
                  >
                    <span className="sr-only">Activer le rapport mensuel</span>
                    <span
                      className={`${
                        notifications.monthlyReport ? 'translate-x-5' : 'translate-x-0'
                      } pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
          <button
            type="button"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-kalel-primary hover:bg-kalel-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kalel-primary"
          >
            Sauvegarder les préférences
          </button>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Sécurité
          </h3>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="current-password" className="block text-sm font-medium text-gray-700">
                Mot de passe actuel
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  name="current-password"
                  id="current-password"
                  className="shadow-sm focus:ring-kalel-primary focus:border-kalel-primary block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                Nouveau mot de passe
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  name="new-password"
                  id="new-password"
                  className="shadow-sm focus:ring-kalel-primary focus:border-kalel-primary block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                Confirmer le nouveau mot de passe
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  name="confirm-password"
                  id="confirm-password"
                  className="shadow-sm focus:ring-kalel-primary focus:border-kalel-primary block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
          <button
            type="button"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-kalel-primary hover:bg-kalel-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kalel-primary"
          >
            Changer le mot de passe
          </button>
        </div>
      </div>
    </div>
  )
} 