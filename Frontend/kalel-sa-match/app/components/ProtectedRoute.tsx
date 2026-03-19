'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '../providers/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  roles?: string[]
  redirectPath?: string
}

export default function ProtectedRoute({ children, roles, redirectPath = '/connexion' }: ProtectedRouteProps) {
  const router = useRouter()
  const { isAuthenticated, hasAnyRole } = useAuth()

  useEffect(() => {
    const checkAuth = () => {
      if (!isAuthenticated) {
        router.push(redirectPath)
        return
      }

      if (roles && roles.length > 0 && !hasAnyRole(roles)) {
        router.push('/403') // Page d'accès refusé
      }
    }

    checkAuth()
  }, [isAuthenticated, hasAnyRole, roles, router, redirectPath])

  if (!isAuthenticated || (roles && roles.length > 0 && !hasAnyRole(roles))) {
    return null
  }

  return <>{children}</>
}
