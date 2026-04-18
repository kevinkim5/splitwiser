import { useEffect, useState, useCallback } from 'react'
import { getAPICall, patchAPICall } from '@/utils/apiManager'
import {
  Box,
  Flex,
  Heading,
  HStack,
  IconButton,
  Text,
  VStack,
} from '@chakra-ui/react'
import { Button } from '@/components/ui/button'
import { FiPlus, FiUsers, FiArchive, FiRefreshCw } from 'react-icons/fi'
import { useRouter } from 'next/router'
import PrimarySpinner from '@/components/PrimarySpinner'
import CreateGroupModal from '@/components/CreateGroupModal'
import { toaster } from '@/components/ui/toaster'
import { Toaster } from '@/components/ui/toaster'
import { Group } from '@/types'

export default function GroupList() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showArchived, setShowArchived] = useState(false)
  const router = useRouter()

  const fetchGroups = useCallback(async () => {
    setLoading(true)
    const data = await getAPICall('/api/groups')
    if (data) setGroups(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchGroups() }, [fetchGroups])

  const handleArchive = async (group: Group, e: React.MouseEvent) => {
    e.stopPropagation()
    const archiving = !group.archived
    try {
      await patchAPICall(`/api/groups/${group.id}`, { archived: archiving })
      toaster.create({
        title: archiving ? `"${group.name}" archived` : `"${group.name}" restored`,
        type: 'info',
        duration: 3000,
      })
      fetchGroups()
    } catch (err) {
      toaster.create({ title: String(err), type: 'error', duration: 4000 })
    }
  }

  if (loading) return <PrimarySpinner />

  const active = groups.filter((g) => !g.archived)
  const archived = groups.filter((g) => g.archived)

  const GroupCard = ({ group }: { group: Group }) => (
    <Box
      key={group.id}
      p={4}
      borderWidth="1px"
      borderRadius="xl"
      bg={group.archived ? 'bg.page' : 'bg.panel'}
      borderColor="border.card"
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
            bg={group.archived ? 'gray.300' : 'teal.500'}
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
            <Text fontWeight="semibold" fontSize="md" color={group.archived ? 'fg.muted' : 'fg.heading'}>
              {group.name}
            </Text>
            <HStack gap={1}>
              <FiUsers size={12} color="#9CA3AF" />
              <Text fontSize="xs" color="fg.muted">
                {group.members.length} member{group.members.length !== 1 ? 's' : ''}
              </Text>
            </HStack>
          </Box>
        </HStack>
        <IconButton
          aria-label={group.archived ? 'Restore group' : 'Archive group'}
          variant="ghost"
          size="sm"
          color="fg.muted"
          _hover={{ color: group.archived ? 'teal.500' : 'fg.label', bg: 'border.card' }}
          onClick={(e) => handleArchive(group, e)}
        >
          {group.archived ? <FiRefreshCw size={14} /> : <FiArchive size={14} />}
        </IconButton>
      </Flex>
    </Box>
  )

  return (
    <>
      <Toaster />
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg" color="fg.heading">My Groups</Heading>
        <Button colorPalette="teal" size="sm" onClick={() => setShowCreate(true)}>
          <FiPlus />
          New Group
        </Button>
      </Flex>

      {active.length === 0 && archived.length === 0 ? (
        <Box textAlign="center" py={16}>
          <Text fontSize="4xl" mb={4}>👥</Text>
          <Text fontWeight="semibold" color="fg.label" mb={2}>No groups yet</Text>
          <Text fontSize="sm" color="fg.muted" mb={6}>
            Create a group to start splitting expenses with friends
          </Text>
          <Button colorPalette="teal" onClick={() => setShowCreate(true)}>
            <FiPlus />
            Create your first group
          </Button>
        </Box>
      ) : (
        <VStack gap={3} align="stretch">
          {active.map((group) => <GroupCard key={group.id} group={group} />)}

          {archived.length > 0 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                color="fg.muted"
                mt={2}
                onClick={() => setShowArchived((v) => !v)}
              >
                {showArchived ? '▾' : '▸'} Archived ({archived.length})
              </Button>
              {showArchived && archived.map((group) => <GroupCard key={group.id} group={group} />)}
            </>
          )}
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
