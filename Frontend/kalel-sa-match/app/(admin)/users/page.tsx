'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  const [users] = useState([
    {
      id: 1,
      firstName: 'Moussa',
      lastName: 'Diop',
      email: 'moussa.diop@example.com',
      phone: '+221 78 594 92 74',
      role: 'manager',
      status: 'active',
      companyName: 'Complexe Be Sport',
      avatar: '/images/avatar-placeholder.png',
      createdAt: '2024-01-15',
      lastLogin: '2024-03-20',
    },
    {
      id: 2,
      firstName: 'Abdou',
      lastName: 'Diallo',
      email: 'abdou.diallo@example.com',
      phone: '+221 77 123 45 67',
      role: 'user',
      status: 'active',
      avatar: '/images/avatar-placeholder.png',
      createdAt: '2024-02-01',
      lastLogin: '2024-03-19',
    },
    {
      id: 3,
      firstName: 'Fatou',
      lastName: 'Sow',
      email: 'fatou.sow@example.com',
      phone: '+221 76 234 56 78',
      role: 'user',
      status: 'inactive',
      avatar: '/images/avatar-placeholder.png',
      createdAt: '2024-02-15',
      lastLogin: '2024-03-10',
    },
  ])

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrateur'
      case 'manager':
        return 'Gérant'
      case 'user':
        return 'Utilisateur'
      default:
        return role
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800'
      case 'manager':
        return 'bg-blue-100 text-blue-800'
      case 'user':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Actif'
      case 'inactive':
        return 'Inactif'
      default:
        return status
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchTerm === '' ||
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm)

    const matchesRole = selectedRole === 'all' || user.role === selectedRole
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus

    return matchesSearch && matchesRole && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">
              Rechercher
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="search"
                id="search"
                className="shadow-sm focus:ring-kalel-primary focus:border-kalel-primary block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Nom, email, téléphone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Rôle
            </label>
            <select
              id="role"
              name="role"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-kalel-primary focus:ring-kalel-primary sm:text-sm"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="all">Tous les rôles</option>
              <option value="admin">Administrateur</option>
              <option value="manager">Gérant</option>
              <option value="user">Utilisateur</option>
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Statut
            </label>
            <select
              id="status"
              name="status"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-kalel-primary focus:ring-kalel-primary sm:text-sm"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Utilisateurs ({filteredUsers.length})
          </h3>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-kalel-primary hover:bg-kalel-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kalel-primary"
          >
            <span className="mr-2">➕</span>
            Ajouter un utilisateur
          </button>
        </div>
        <div className="border-t border-gray-200">
          <ul role="list" className="divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <li key={user.id} className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 h-12 w-12 relative">
                    <Image
                      src={user.avatar}
                      alt={`${user.firstName} ${user.lastName}`}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(
                            user.role
                          )}`}
                        >
                          {getRoleText(user.role)}
                        </span>
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            user.status
                          )}`}
                        >
                          {getStatusText(user.status)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-1">
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      <p className="text-sm text-gray-500 truncate">{user.phone}</p>
                    </div>
                    {user.role === 'manager' && (
                      <p className="mt-1 text-sm text-gray-500 truncate">
                        {user.companyName}
                      </p>
                    )}
                    <div className="mt-2 text-xs text-gray-500">
                      <span>
                        Inscrit le {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                      <span className="mx-2">•</span>
                      <span>
                        Dernière connexion le{' '}
                        {new Date(user.lastLogin).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-white bg-kalel-primary hover:bg-kalel-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kalel-primary"
                    >
                      Modifier
                    </button>
                    {user.status === 'active' ? (
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Désactiver
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Activer
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
} 