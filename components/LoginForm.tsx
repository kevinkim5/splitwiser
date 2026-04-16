import { useState } from 'react'
import {
  Box,
  Input,
  VStack,
  Text,
  Heading,
} from '@chakra-ui/react'
import { Button } from '@/components/ui/button'
import { PasswordInput } from '@/components/ui/password-input'
import { Toaster } from '@/components/ui/toaster'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginForm() {
  const { login } = useAuth()
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

  return (
    <Box maxW="sm" mx="auto" mt={16} p={8} boxShadow="lg" borderRadius="xl" bg="white">
      <Toaster />
      <VStack gap={6}>
        <VStack gap={1}>
          <Heading size="lg" color="teal.600">Welcome back</Heading>
          <Text fontSize="sm" color="gray.500">Sign in to your SplitWiser account</Text>
        </VStack>

        <VStack gap={4} w="full">
          <Box w="full">
            <Text fontSize="sm" fontWeight="medium" mb={1} color="gray.700">Mobile Number</Text>
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
            <Text fontSize="sm" fontWeight="medium" mb={1} color="gray.700">Password</Text>
            <PasswordInput
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleLogin() }}
            />
          </Box>
        </VStack>

        {error && (
          <Box w="full" p={3} bg="red.50" borderRadius="md" borderWidth="1px" borderColor="red.200">
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

        <Text fontSize="sm" color="gray.400" textAlign="center">
          No account? Contact an admin to be added.
        </Text>
      </VStack>
    </Box>
  )
}
