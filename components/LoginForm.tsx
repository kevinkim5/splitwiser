import { useEffect, useState } from 'react'
import Script from 'next/script'
import {
  Box,
  Input,
  VStack,
  Text,
  Heading,
  Separator,
} from '@chakra-ui/react'
import { Button } from '@/components/ui/button'
import { PasswordInput } from '@/components/ui/password-input'
import { Toaster } from '@/components/ui/toaster'
import { useAuth } from '@/contexts/AuthContext'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: object) => void
          renderButton: (el: HTMLElement | null, config: object) => void
        }
      }
    }
  }
}

export default function LoginForm() {
  const { login, loginWithGoogle } = useAuth()
  const [error, setError] = useState('')
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setError('')
    setLoading(true)
    await login(mobile, password, setError)
    setLoading(false)
  }

  const initGoogle = () => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) return
    window.google?.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      callback: async (response: { credential: string }) => {
        setError('')
        await loginWithGoogle(response.credential, setError)
      },
    })
    window.google?.accounts.id.renderButton(
      document.getElementById('google-signin-btn'),
      { theme: 'outline', size: 'large', width: '100%', text: 'signin_with' },
    )
  }

  useEffect(() => {
    // Re-init if script already loaded (e.g. hot reload)
    if (window.google) initGoogle()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Box maxW="sm" mx="auto" mt={16} p={8} boxShadow="lg" borderRadius="xl" bg="bg.panel">
      <Toaster />
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={initGoogle}
      />
      <VStack gap={6}>
        <VStack gap={1}>
          <Heading size="lg" color="teal.600">Welcome back</Heading>
          <Text fontSize="sm" color="fg.muted">Sign in to your SplitWiser account</Text>
        </VStack>

        <VStack gap={4} w="full">
          <Box w="full">
            <Text fontSize="sm" fontWeight="medium" mb={1} color="fg.label">Mobile Number</Text>
            <Input
              placeholder="e.g. 91234567"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              type="tel"
              maxLength={8}
              size="md"
            />
          </Box>

          <Box w="full">
            <Text fontSize="sm" fontWeight="medium" mb={1} color="fg.label">Password</Text>
            <PasswordInput
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleLogin() }}
            />
          </Box>
        </VStack>

        {error && (
          <Box w="full" p={3} bg="red.50" borderRadius="md" borderWidth="1px" borderColor="red.200" _dark={{ bg: 'red.950', borderColor: 'red.800' }}>
            <Text color="red.600" fontSize="sm">{error}</Text>
          </Box>
        )}

        <Button
          colorPalette="teal"
          onClick={handleLogin}
          w="full"
          size="md"
          loading={loading}
          loadingText="Signing in..."
        >
          Sign In
        </Button>

        {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
          <>
            <Separator w="full" />
            <Box w="full" id="google-signin-btn" />
          </>
        )}

        <Text fontSize="sm" color="fg.muted" textAlign="center">
          No account? Contact an admin to be added.
        </Text>
      </VStack>
    </Box>
  )
}
