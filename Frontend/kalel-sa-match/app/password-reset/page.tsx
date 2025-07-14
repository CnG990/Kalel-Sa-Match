'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../providers/AuthContext'
import Link from 'next/link'
import Logo from '../components/Logo'

export default function PasswordReset() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()
  const { resendVerificationEmail } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      await resendVerificationEmail({ email })
      setSuccess('Un nouvel email de vérification a été envoyé')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
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
            <h1 className="text-3xl font-extrabold text-gray-900">Vérification de l'email</h1>
            <p className="mt-2 text-sm text-gray-600">
              Nous avons envoyé un email de vérification à votre adresse. Veuillez cliquer sur le lien pour vérifier votre compte.
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

          {success && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </div>
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
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
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-kalel-primary focus:border-kalel-primary focus:z-10 sm:text-sm"
                  placeholder="Votre email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-kalel-primary hover:bg-kalel-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kalel-primary"
              >
                Renvoyer l'email de vérification
              </button>
            </div>
          </form>

          <div className="text-center mt-4">
            <Link href="/connexion" className="text-sm text-kalel-secondary hover:text-kalel-secondary-dark">
              Retour à la connexion
            </Link>
          </div>
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
