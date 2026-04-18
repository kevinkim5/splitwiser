import { useState } from 'react'
import Link from 'next/link'
import {
  Box,
  Input,
  VStack,
  Text,
  Heading,
  HStack,
} from '@chakra-ui/react'
import { Button } from '@/components/ui/button'
import { PasswordInput } from '@/components/ui/password-input'
import { Toaster } from '@/components/ui/toaster'
import { useAuth } from '@/contexts/AuthContext'

export default function RegisterForm() {
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    setError('')
    setLoading(true)
    await register(name, mobile, password, setError)
    setLoading(false)
  }

  return (
    <Box maxW="sm" mx="auto" mt={16} p={8} boxShadow="lg" borderRadius="xl" bg="bg.panel">
      <Toaster />
      <VStack gap={6}>
        <VStack gap={1}>
          <Heading size="lg" color="teal.600">Create account</Heading>
          <Text fontSize="sm" color="fg.muted">Join SplitWiser to split expenses easily</Text>
        </VStack>

        <VStack gap={4} w="full">
          <Box w="full">
            <Text fontSize="sm" fontWeight="medium" mb={1} color="fg.label">Full Name</Text>
            <Input
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Box>

          <Box w="full">
            <Text fontSize="sm" fontWeight="medium" mb={1} color="fg.label">Mobile Number</Text>
            <Input
              placeholder="e.g. 91234567"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              type="tel"
              maxLength={8}
            />
            <Text fontSize="xs" color="fg.muted" mt={1}>8-digit Singapore number starting with 8 or 9</Text>
          </Box>

          <Box w="full">
            <Text fontSize="sm" fontWeight="medium" mb={1} color="fg.label">Password</Text>
            <PasswordInput
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleRegister() }}
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
          onClick={handleRegister}
          w="full"
          size="md"
          loading={loading}
          loadingText="Creating account..."
        >
          Create Account
        </Button>

        <HStack gap={1}>
          <Text fontSize="sm" color="fg.muted">Already have an account?</Text>
          <Link href="/login">
            <Text fontSize="sm" color="teal.600" fontWeight="medium" _hover={{ textDecoration: 'underline' }}>
              Sign in
            </Text>
          </Link>
        </HStack>
      </VStack>
    </Box>
  )
}
