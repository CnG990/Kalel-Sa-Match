'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../providers/AuthContext'
import { toast } from 'react-toastify'

export default function SessionManager() {
  const router = useRouter()
  const { isAuthenticated, logout } = useAuth()

  useEffect(() => {
    // Écouter les changements de session
    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === 'auth_token') {
      // Si le token est supprimé, déconnecter l'utilisateur
      if (!event.newValue) {
        logout()
        router.push('/connexion')
        toast.error('Session expirée')
      }
    }
  }

  // Vérifier périodiquement la validité du token
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Vérifier si le token est toujours valide
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        })

        if (!response.ok) {
          logout()
          router.push('/connexion')
          toast.error('Session expirée')
        }
      } catch (error) {
        logout()
        router.push('/connexion')
        toast.error('Erreur de session')
      }
    }

    // Vérifier toutes les 5 minutes
    const interval = setInterval(checkSession, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [isAuthenticated, logout, router])

  return null
}
