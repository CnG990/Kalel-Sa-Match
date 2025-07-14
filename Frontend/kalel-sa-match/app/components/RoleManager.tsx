'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../providers/AuthContext'
import { toast } from 'react-toastify'

interface RoleManagerProps {
  children: React.ReactNode
  allowedRoles: string[]
  redirectPath?: string
}

export default function RoleManager({ children, allowedRoles, redirectPath = '/403' }: RoleManagerProps) {
  const router = useRouter()
  const { user, hasAnyRole } = useAuth()

  useEffect(() => {
    if (user && !hasAnyRole(allowedRoles)) {
      router.push(redirectPath)
      toast.error('Accès refusé')
    }
  }, [user, hasAnyRole, allowedRoles, router])

  if (user && !hasAnyRole(allowedRoles)) {
    return null
  }

  return <>{children}</>
}
