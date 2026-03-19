'use client'

import { useEffect } from 'react'
import { toast } from 'react-toastify'
import { useAuth } from '../providers/AuthContext'
import { useTranslation } from 'react-i18next'

export default function NotificationManager() {
  const { t } = useTranslation()
  const { user } = useAuth()

  useEffect(() => {
    // Demander la permission pour les notifications
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    // Gérer les notifications push
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      registerPushNotifications()
    }
  }, [])

  const registerPushNotifications = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js')
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      })

      // Envoyer la subscription au backend
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ subscription })
      })
    } catch (error) {
      console.error('Erreur lors de l\'inscription aux notifications:', error)
    }
  }

  // Gérer les notifications reçues
  useEffect(() => {
    const handleNotification = (event: PushEvent) => {
      const data = event.data.json()
      
      // Afficher la notification
      toast(data.message, {
        type: data.type === 'error' ? 'error' : 'success',
        position: 'top-right',
        autoClose: 5000,
        closeOnClick: true,
        pauseOnHover: true
      })
    }

    navigator.serviceWorker.addEventListener('push', handleNotification)
    return () => {
      navigator.serviceWorker.removeEventListener('push', handleNotification)
    }
  }, [])

  return null
}
