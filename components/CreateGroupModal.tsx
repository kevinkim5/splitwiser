import { useState, useEffect } from 'react'
import {
  Box,
  Input,
  VStack,
  Text,
  HStack,
  Flex,
  Badge,
  Checkbox,
} from '@chakra-ui/react'
import { Button } from '@/components/ui/button'
import { FiX } from 'react-icons/fi'
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogCloseTrigger,
} from '@/components/ui/dialog'
import { getAPICall, postAPICall } from '@/utils/apiManager'
import { useAuth } from '@/contexts/AuthContext'
import { toaster } from '@/components/ui/toaster'

type UserOption = { id: string; name: string; mobile: string }

interface CreateGroupModalProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

export default function CreateGroupModal({ open, onClose, onCreated }: CreateGroupModalProps) {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [users, setUsers] = useState<UserOption[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      getAPICall('/api/users').then((data) => {
        if (data) setUsers(data.filter((u: UserOption) => u.id !== user?.id))
      })
    }
  }, [open, user?.id])

  const toggleUser = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const handleCreate = async () => {
    if (!name.trim()) {
      toaster.create({ title: 'Group name is required', type: 'error', duration: 3000 })
      return
    }
    setLoading(true)
    try {
      await postAPICall('/api/groups', { name: name.trim(), memberIds: selectedIds })
      toaster.create({ title: 'Group created!', type: 'success', duration: 3000 })
      setName('')
      setSelectedIds([])
      onCreated()
      onClose()
    } catch (err) {
      toaster.create({ title: String(err), type: 'error', duration: 4000 })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DialogRoot open={open} onOpenChange={(e) => !e.open && onClose()} size="md">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
          <DialogCloseTrigger />
        </DialogHeader>
        <DialogBody>
          <VStack gap={4} align="stretch">
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={1} color="fg.label">Group Name</Text>
              <Input
                placeholder="e.g. Tokyo Trip, Housemates"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2} color="fg.label">
                Add Members
              </Text>
              {selectedIds.length > 0 && (
                <Flex gap={2} flexWrap="wrap" mb={3}>
                  {selectedIds.map((id) => {
                    const u = users.find((x) => x.id === id)
                    return (
                      <Badge key={id} colorPalette="teal" variant="subtle" borderRadius="full" px={2}>
                        <HStack gap={1}>
                          <Text fontSize="xs">{u?.name}</Text>
                          <Box as="button" onClick={() => toggleUser(id)} display="flex">
                            <FiX size={10} />
                          </Box>
                        </HStack>
                      </Badge>
                    )
                  })}
                </Flex>
              )}
              <VStack gap={2} align="stretch" maxH="200px" overflowY="auto">
                {users.map((u) => (
                  <HStack
                    key={u.id}
                    p={2}
                    borderRadius="md"
                    cursor="pointer"
                    _hover={{ bg: 'bg.page' }}
                    onClick={() => toggleUser(u.id)}
                  >
                    <Checkbox.Root checked={selectedIds.includes(u.id)} colorPalette="teal">
                      <Checkbox.HiddenInput />
                      <Checkbox.Control />
                    </Checkbox.Root>
                    <Box>
                      <Text fontSize="sm" fontWeight="medium">{u.name}</Text>
                      <Text fontSize="xs" color="fg.muted">{u.mobile}</Text>
                    </Box>
                  </HStack>
                ))}
                {users.length === 0 && (
                  <Text fontSize="sm" color="fg.muted" textAlign="center" py={4}>
                    No other users found
                  </Text>
                )}
              </VStack>
            </Box>
          </VStack>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} mr={2}>Cancel</Button>
          <Button colorPalette="teal" onClick={handleCreate} loading={loading}>
            Create Group
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  )
}
