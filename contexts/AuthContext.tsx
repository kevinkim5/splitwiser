import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { toaster } from '@/components/ui/toaster'
import { useRouter } from 'next/router'
import { getAPICall, postAPICall } from '@/utils/apiManager'

type User = {
  id: string
  name: string
  mobile?: string
  admin: boolean
}

type AuthContextType = {
  user: User | null
  login: (mobile: string, password: string, setError: (e: string) => void) => Promise<void>
  register: (name: string, mobile: string, password: string, setError: (e: string) => void) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function validateSession() {
      try {
        const response = await getAPICall('/api/users/session')
        if (response?.user) {
          setUser(response.user)
        } else {
          setUser(null)
        }
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    validateSession()
  }, [])

  const login = async (
    mobile: string,
    password: string,
    setError: (e: string) => void,
  ) => {
    try {
      const res = await postAPICall('/api/users/login', { mobile, password })
      setUser(res.user)
      router.push('/groups')
    } catch (error) {
      const msg = String(error)
      setError(msg)
    }
  }

  const register = async (
    name: string,
    mobile: string,
    password: string,
    setError: (e: string) => void,
  ) => {
    try {
      const res = await postAPICall('/api/users/register', { name, mobile, password })
      setUser(res.user)
      router.push('/groups')
    } catch (error) {
      const msg = String(error)
      setError(msg)
    }
  }

  const logout = async () => {
    try {
      await postAPICall('/api/users/logout', {})
    } catch {
      // ignore
    }
    setUser(null)
    router.push('/login')
    toaster.create({ title: 'Logged out', type: 'info', duration: 3000 })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
