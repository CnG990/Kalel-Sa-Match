'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../providers/AuthContext'
import { RegisterRequest } from '../services/auth'
import Logo from '../components/Logo'

export default function Inscription() {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    password: '',
    confirmPassword: '',
    role: 'client' as 'client' | 'gestionnaire',
    acceptTerms: false,
  })
  
  const router = useRouter()
  const { register, isLoading, error, clearError } = useAuth()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    
    // Validation des champs
    if (formData.password !== formData.confirmPassword) {
      alert('Les mots de passe ne correspondent pas')
      return
    }
    
    if (!formData.acceptTerms) {
      alert('Vous devez accepter les conditions d\'utilisation')
      return
    }

    try {
      const registerData: RegisterRequest = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        telephone: formData.telephone,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
        role: formData.role,
        accept_terms: formData.acceptTerms
      }

      await register(registerData)
      
      // Redirection basée sur le rôle après inscription réussie
      if (formData.role === 'gestionnaire') {
        router.push('/gerant/dashboard')
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      // L'erreur est déjà gérée par le context
      console.error('Erreur d\'inscription:', err)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* En-tête */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/" className="flex items-center">
            <Logo className="h-12 w-auto" />
            <div className="ml-2">
              <span className="text-xl font-bold text-kalel-primary">Kalèl sa</span>
              <span className="text-lg font-semibold text-kalel-secondary">Match</span>
            </div>
          </Link>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900">Créer un compte</h1>
            <p className="mt-2 text-sm text-gray-600">
              Ou{' '}
              <Link href="/connexion" className="font-medium text-kalel-secondary hover:text-kalel-secondary-dark">
                connectez-vous à votre compte
              </Link>
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="prenom" className="sr-only">
                    Prénom
                  </label>
                  <input
                    id="prenom"
                    name="prenom"
                    type="text"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-tl-md focus:outline-none focus:ring-kalel-primary focus:border-kalel-primary focus:z-10 sm:text-sm"
                    placeholder="Prénom"
                    value={formData.prenom}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label htmlFor="nom" className="sr-only">
                    Nom
                  </label>
                  <input
                    id="nom"
                    name="nom"
                    type="text"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-tr-md focus:outline-none focus:ring-kalel-primary focus:border-kalel-primary focus:z-10 sm:text-sm"
                    placeholder="Nom"
                    value={formData.nom}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="sr-only">
                  Adresse email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-kalel-primary focus:border-kalel-primary focus:z-10 sm:text-sm"
                  placeholder="Adresse email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
              <div>
                <label htmlFor="telephone" className="sr-only">
                  Téléphone
                </label>
                <input
                  id="telephone"
                  name="telephone"
                  type="tel"
                  autoComplete="tel"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-kalel-primary focus:border-kalel-primary focus:z-10 sm:text-sm"
                  placeholder="Téléphone (+221...)"
                  value={formData.telephone}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
              <div>
                <label htmlFor="role" className="sr-only">
                  Type de compte
                </label>
                <select
                  id="role"
                  name="role"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-kalel-primary focus:border-kalel-primary focus:z-10 sm:text-sm"
                  value={formData.role}
                  onChange={handleChange}
                  disabled={isLoading}
                >
                  <option value="client">Client - Je veux réserver des terrains</option>
                  <option value="gestionnaire">Gestionnaire - Je gère des terrains</option>
                </select>
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Mot de passe
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-kalel-primary focus:border-kalel-primary focus:z-10 sm:text-sm"
                  placeholder="Mot de passe (min. 8 caractères)"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="sr-only">
                  Confirmer le mot de passe
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-kalel-primary focus:border-kalel-primary focus:z-10 sm:text-sm"
                  placeholder="Confirmer le mot de passe"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex items-center">
                <input
                  id="acceptTerms"
                  name="acceptTerms"
                  type="checkbox"
                  className="h-4 w-4 text-kalel-primary focus:ring-kalel-primary border-gray-300 rounded"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                disabled={isLoading}
                required
                />
              <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-900">
                  J'accepte les{' '}
                <Link href="/terms" target="_blank" className="text-kalel-secondary hover:text-kalel-secondary-dark font-semibold underline">
                    conditions d'utilisation
                </Link>
                {' '}et la{' '}
                <Link href="/privacy" target="_blank" className="text-kalel-secondary hover:text-kalel-secondary-dark font-semibold underline">
                  politique de confidentialité
                </Link>
                {' '}et je comprends toutes les règles de réservation, d'annulation et de pénalités.
                </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-kalel-primary hover:bg-kalel-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kalel-primary transition-colors ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-kalel-primary-light group-hover:text-kalel-primary-dark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                    </svg>
                  )}
                </span>
                {isLoading ? 'Création du compte...' : 'Créer mon compte'}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Vous avez déjà un compte ?{' '}
                <Link href="/connexion" className="font-medium text-kalel-secondary hover:text-kalel-secondary-dark">
                  Connectez-vous
                </Link>
              </p>
            </div>
          </form>
        </div>
      </main>

      {/* Pied de page */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-6 px-4 overflow-hidden sm:px-6 lg:px-8">
          <p className="text-center text-base text-gray-500">
            &copy; {new Date().getFullYear()} Kalèl sa Match. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  )
}
