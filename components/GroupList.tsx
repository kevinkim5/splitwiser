import { useEffect, useState } from 'react'
import { getAPICall } from '@/utils/apiManager'
import { Box, Heading, Text, VStack } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import PrimarySpinner from '@/components/PrimarySpinner'

type Group = {
  _id: string
  name: string
  members: string[]
}

export default function GroupList() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchGroups() {
      const data = await getAPICall('/api/groups')
      setGroups(data)
      setLoading(false)
    }
    fetchGroups()
  }, [])

  if (loading) {
    return <PrimarySpinner />
  }

  if (groups.length === 0) {
    return (
      <Box textAlign="center" mt={10}>
        <Text>No groups found. Create a group to get started!</Text>
      </Box>
    )
  }

  return (
    <VStack gap={4} align="stretch" mt={6} px={4}>
      {groups.map((group) => (
        <Box
          key={group._id}
          p={4}
          borderWidth="1px"
          borderRadius="lg"
          boxShadow="sm"
          bg="white"
          _hover={{ boxShadow: 'md', cursor: 'pointer' }}
          onClick={() => router.push(`/groups/${group._id}`)}
        >
          <Heading size="md">{group.name}</Heading>
          <Text fontSize="sm" color="gray.500">
            {group.members.length} members
          </Text>
        </Box>
      ))}
    </VStack>
  )
}
