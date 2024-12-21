import { useState } from 'react'
import { Box, Button, Input, VStack, Text } from '@chakra-ui/react'
import { Toaster } from '@/components/ui/toaster'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginForm() {
  const { login } = useAuth()
  const [error, setError] = useState('')
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async () => {
    login(mobile, password, setError)
  }

  return (
    <Box maxW="sm" mx="auto" mt={8} p={4} boxShadow="md" borderRadius="md">
      <Toaster />
      <Text fontSize="lg" mb={4} fontWeight="bold" textAlign="center">
        Login
      </Text>
      <VStack gap={4}>
        <Input
          placeholder="Enter your mobile number"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          type="tel"
          pattern="[89][0-9]{7}"
          maxLength={8}
        />
        <Input
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleLogin()
            }
          }}
          type="password"
        />
        <Button colorScheme="teal" onClick={handleLogin} w="full">
          Login
        </Button>
        {error && <Text color="red">{error}</Text>}
      </VStack>
    </Box>
  )
}
