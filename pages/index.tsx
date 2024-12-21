import { useEffect } from 'react'
import router from 'next/router'
import PrimarySpinner from '@/components/PrimarySpinner'
import { useAuth } from '@/contexts/AuthContext'

export default function Home() {
  const { loading, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    } else {
      router.push('/groups')
    }
  }, [loading, isAuthenticated])

  return <PrimarySpinner />
}
