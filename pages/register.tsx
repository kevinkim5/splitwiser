import { useEffect } from 'react'
import { useRouter } from 'next/router'
import PrimarySpinner from '@/components/PrimarySpinner'

// Public registration is disabled — users are added by an admin.
export default function RegisterPage() {
  const router = useRouter()
  useEffect(() => { router.replace('/login') }, [router])
  return <PrimarySpinner />
}
