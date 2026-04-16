import { useCallback, useEffect, useState } from 'react'
import {
  Box,
  Flex,
  Heading,
  HStack,
  IconButton,
  Input,
  Text,
  VStack,
  Badge,
} from '@chakra-ui/react'
import { Button } from '@/components/ui/button'
import { FiPlus, FiTrash2 } from 'react-icons/fi'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'
import { getAPICall, postAPICall, deleteAPICall } from '@/utils/apiManager'
import { toaster } from '@/components/ui/toaster'
import { Toaster } from '@/components/ui/toaster'
import { PasswordInput } from '@/components/ui/password-input'
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogCloseTrigger,
} from '@/components/ui/dialog'
import PrimarySpinner from '@/components/PrimarySpinner'

type UserRow = {
  id: string
  name: string
  mobile: string
  admin: boolean
  created_at: string
}

export default function AdminPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)

  // Redirect non-admins
  useEffect(() => {
    if (user && !user.admin) router.replace('/groups')
  }, [user, router])

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    const data = await getAPICall('/api/admin/users')
    if (data) setUsers(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleDelete = async (userId: string, name: string) => {
    if (!confirm(`Remove ${name}? They will no longer be able to log in.`)) return
    try {
      await deleteAPICall(`/api/admin/users?userId=${userId}`)
      toaster.create({ title: `${name} removed`, type: 'info', duration: 3000 })
      fetchUsers()
    } catch (err) {
      toaster.create({ title: String(err), type: 'error', duration: 4000 })
    }
  }

  if (!user?.admin) return null
  if (loading) return <PrimarySpinner />

  return (
    <>
      <Toaster />
      <Box maxW="2xl" mx="auto" py={8} px={4}>
        <Flex justify="space-between" align="center" mb={6}>
          <Box>
            <Heading size="lg" color="gray.800">User Management</Heading>
            <Text fontSize="sm" color="gray.500" mt={1}>{users.length} registered user{users.length !== 1 ? 's' : ''}</Text>
          </Box>
          <Button colorPalette="teal" size="sm" onClick={() => setShowAdd(true)}>
            <FiPlus />
            Add User
          </Button>
        </Flex>

        <VStack gap={2} align="stretch">
          {users.map((u) => (
            <Flex
              key={u.id}
              p={4}
              bg="white"
              borderWidth="1px"
              borderRadius="xl"
              borderColor="gray.100"
              align="center"
              justify="space-between"
            >
              <HStack gap={3}>
                <Box
                  w="40px"
                  h="40px"
                  borderRadius="full"
                  bg="teal.100"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexShrink={0}
                >
                  <Text fontWeight="bold" color="teal.700">
                    {u.name.charAt(0).toUpperCase()}
                  </Text>
                </Box>
                <Box>
                  <HStack gap={2}>
                    <Text fontWeight="semibold" fontSize="sm">{u.name}</Text>
                    {u.admin && <Badge colorPalette="purple" variant="subtle" size="sm">admin</Badge>}
                    {u.id === user.id && <Badge colorPalette="gray" variant="subtle" size="sm">you</Badge>}
                  </HStack>
                  <Text fontSize="xs" color="gray.500">{u.mobile}</Text>
                </Box>
              </HStack>

              {u.id !== user.id && (
                <IconButton
                  aria-label="Remove user"
                  variant="ghost"
                  size="sm"
                  color="gray.400"
                  _hover={{ color: 'red.500', bg: 'red.50' }}
                  onClick={() => handleDelete(u.id, u.name)}
                >
                  <FiTrash2 />
                </IconButton>
              )}
            </Flex>
          ))}
        </VStack>
      </Box>

      <AddUserModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onAdded={fetchUsers}
      />
    </>
  )
}

function AddUserModal({
  open,
  onClose,
  onAdded,
}: {
  open: boolean
  onClose: () => void
  onAdded: () => void
}) {
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const reset = () => { setName(''); setMobile(''); setPassword('') }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await postAPICall('/api/admin/users', { name, mobile, password })
      toaster.create({ title: `${name} added successfully`, type: 'success', duration: 3000 })
      reset()
      onAdded()
      onClose()
    } catch (err) {
      toaster.create({ title: String(err), type: 'error', duration: 4000 })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DialogRoot open={open} onOpenChange={(e) => { if (!e.open) { reset(); onClose() } }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogCloseTrigger />
        </DialogHeader>
        <DialogBody>
          <VStack gap={4} align="stretch">
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={1} color="gray.700">Full Name</Text>
              <Input
                placeholder="e.g. Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </Box>
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={1} color="gray.700">Mobile Number</Text>
              <Input
                placeholder="e.g. 91234567"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                type="tel"
                maxLength={8}
              />
              <Text fontSize="xs" color="gray.400" mt={1}>8-digit Singapore number starting with 8 or 9</Text>
            </Box>
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={1} color="gray.700">Temporary Password</Text>
              <PasswordInput
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
              />
              <Text fontSize="xs" color="gray.400" mt={1}>Share this with the user — they can change it later.</Text>
            </Box>
          </VStack>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} mr={2}>Cancel</Button>
          <Button colorPalette="teal" onClick={handleSubmit} loading={loading}>
            Add User
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  )
}
