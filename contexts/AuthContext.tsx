import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { toaster } from '@/components/ui/toaster'
import { useRouter } from 'next/navigation'
import { getAPICall, postAPICall } from '@/utils/apiManager'
import { AxiosError } from 'axios'

type User = {
  id: string
  name: string
  email: string
  avatarUrl?: string
}

type AuthContextType = {
  user: User | null
  login: (
    email: string,
    password: string,
    setError: (error: string) => void,
  ) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  // Verify session on load
  useEffect(() => {
    async function validateSession() {
      try {
        const response = await getAPICall('/api/users/session')
        if (response) {
          setUser(response.user)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Error validating session:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    validateSession()
  }, [])

  // Login function
  const login = async (
    mobile: string,
    password: string,
    setError: (error: string) => void,
  ) => {
    try {
      const loginRes = await postAPICall('/api/users/login', {
        mobile,
        password,
      })

      setUser(loginRes.user)
      router.push('/')
    } catch (error) {
      setError(error as string)
      toaster.create({
        title: 'Login failed',
        description: error as string,
        type: 'error',
        duration: 5000,
      })
    }
  }

  // Logout function
  const logout = async () => {
    try {
      await fetch('/api/users/logout', { method: 'POST' })
      setUser(null)
      toaster.create({
        title: 'Logged out',
        type: 'info',
        duration: 5000,
      })
    } catch (error) {
      toaster.create({
        title: 'Logout failed',
        description: error as string,
        type: 'error',
        duration: 5000,
      })
    }
  }

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthenticated, loading }}
    >
      {!loading && children}
    </AuthContext.Provider>
  )
}

// Custom hook for using AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
