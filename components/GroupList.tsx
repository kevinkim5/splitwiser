import { useEffect, useState, useCallback } from 'react'
import { getAPICall } from '@/utils/apiManager'
import {
  Box,
  Flex,
  Heading,
  HStack,
  Text,
  VStack,
} from '@chakra-ui/react'
import { Button } from '@/components/ui/button'
import { FiPlus, FiUsers } from 'react-icons/fi'
import { useRouter } from 'next/router'
import PrimarySpinner from '@/components/PrimarySpinner'
import CreateGroupModal from '@/components/CreateGroupModal'
import { Group } from '@/types'

export default function GroupList() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const router = useRouter()

  const fetchGroups = useCallback(async () => {
    setLoading(true)
    const data = await getAPICall('/api/groups')
    if (data) setGroups(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchGroups()
  }, [fetchGroups])

  if (loading) return <PrimarySpinner />

  return (
    <>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg" color="gray.800">My Groups</Heading>
        <Button
          colorPalette="teal"
          size="sm"
          onClick={() => setShowCreate(true)}
        >
          <FiPlus />
          New Group
        </Button>
      </Flex>

      {groups.length === 0 ? (
        <Box textAlign="center" py={16}>
          <Text fontSize="4xl" mb={4}>👥</Text>
          <Text fontWeight="semibold" color="gray.700" mb={2}>No groups yet</Text>
          <Text fontSize="sm" color="gray.500" mb={6}>
            Create a group to start splitting expenses with friends
          </Text>
          <Button colorPalette="teal" onClick={() => setShowCreate(true)}>
            <FiPlus />
            Create your first group
          </Button>
        </Box>
      ) : (
        <VStack gap={3} align="stretch">
          {groups.map((group) => (
            <Box
              key={group.id}
              p={4}
              borderWidth="1px"
              borderRadius="xl"
              bg="white"
              borderColor="gray.100"
              boxShadow="xs"
              cursor="pointer"
              _hover={{ boxShadow: 'sm', borderColor: 'teal.200' }}
              transition="all 0.15s"
              onClick={() => router.push(`/groups/${group.id}`)}
            >
              <Flex justify="space-between" align="center">
                <HStack gap={3}>
                  <Box
                    w="42px"
                    h="42px"
                    borderRadius="lg"
                    bg="teal.500"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink={0}
                  >
                    <Text color="white" fontWeight="bold" fontSize="lg">
                      {group.name.charAt(0).toUpperCase()}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontWeight="semibold" fontSize="md" color="gray.800">
                      {group.name}
                    </Text>
                    <HStack gap={1}>
                      <FiUsers size={12} color="#9CA3AF" />
                      <Text fontSize="xs" color="gray.500">
                        {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                      </Text>
                    </HStack>
                  </Box>
                </HStack>
              </Flex>
            </Box>
          ))}
        </VStack>
      )}

      <CreateGroupModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={fetchGroups}
      />
    </>
  )
}
