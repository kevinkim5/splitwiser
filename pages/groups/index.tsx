import { Box, Heading } from '@chakra-ui/react'
import GroupList from '@/components/GroupList'
import { useAuth } from '@/contexts/AuthContext'

export default function GroupsPage() {
  const { user } = useAuth()
  return (
    <Box maxW="lg" mx="auto" mt={6} px={4}>
      <Heading size="lg" mb={4} textAlign="center">
        Welcome, {user?.name}!
      </Heading>
      <GroupList />
    </Box>
  )
}
