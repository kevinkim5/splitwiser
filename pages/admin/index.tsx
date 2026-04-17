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
  Separator,
} from '@chakra-ui/react'
import { Button } from '@/components/ui/button'
import { FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'
import { getAPICall, postAPICall, patchAPICall, deleteAPICall } from '@/utils/apiManager'
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
import { Category } from '@/types'

type UserRow = {
  id: string
  name: string
  mobile: string
  email: string | null
  admin: boolean
  created_at: string
}

export default function AdminPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<UserRow[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddUser, setShowAddUser] = useState(false)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [editingUser, setEditingUser] = useState<UserRow | null>(null)

  useEffect(() => {
    if (user && !user.admin) router.replace('/groups')
  }, [user, router])

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [usersData, categoriesData] = await Promise.all([
      getAPICall('/api/admin/users'),
      getAPICall('/api/categories'),
    ])
    if (usersData) setUsers(usersData)
    if (categoriesData) setCategories(categoriesData)
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleDeleteUser = async (userId: string, name: string) => {
    if (!confirm(`Remove ${name}? They will no longer be able to log in.`)) return
    try {
      await deleteAPICall(`/api/admin/users?userId=${userId}`)
      toaster.create({ title: `${name} removed`, type: 'info', duration: 3000 })
      fetchData()
    } catch (err) {
      toaster.create({ title: String(err), type: 'error', duration: 4000 })
    }
  }

  const handleDeleteCategory = async (categoryId: string, name: string) => {
    if (!confirm(`Delete "${name}"? Existing expenses will keep their data but lose the category label.`)) return
    try {
      await deleteAPICall(`/api/admin/categories?categoryId=${categoryId}`)
      toaster.create({ title: `"${name}" deleted`, type: 'info', duration: 3000 })
      fetchData()
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

        {/* Users section */}
        <Flex justify="space-between" align="center" mb={4}>
          <Box>
            <Heading size="lg" color="gray.800">Users</Heading>
            <Text fontSize="sm" color="gray.500" mt={1}>{users.length} registered</Text>
          </Box>
          <Button colorPalette="teal" size="sm" onClick={() => setShowAddUser(true)}>
            <FiPlus />
            Add User
          </Button>
        </Flex>

        <VStack gap={2} align="stretch" mb={10}>
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
                  w="40px" h="40px" borderRadius="full" bg="teal.100"
                  display="flex" alignItems="center" justifyContent="center" flexShrink={0}
                >
                  <Text fontWeight="bold" color="teal.700">{u.name.charAt(0).toUpperCase()}</Text>
                </Box>
                <Box>
                  <HStack gap={2}>
                    <Text fontWeight="semibold" fontSize="sm">{u.name}</Text>
                    {u.admin && <Badge colorPalette="purple" variant="subtle" size="sm">admin</Badge>}
                    {u.id === user.id && <Badge colorPalette="gray" variant="subtle" size="sm">you</Badge>}
                  </HStack>
                  <Text fontSize="xs" color="gray.500">{u.mobile}</Text>
                  {u.email
                    ? <Text fontSize="xs" color="teal.600">{u.email}</Text>
                    : <Text fontSize="xs" color="gray.300">no google account linked</Text>
                  }
                </Box>
              </HStack>
              <HStack gap={1}>
                <IconButton
                  aria-label="Edit email" variant="ghost" size="sm"
                  color="gray.400" _hover={{ color: 'teal.500', bg: 'teal.50' }}
                  onClick={() => setEditingUser(u)}
                >
                  <FiEdit2 />
                </IconButton>
                {u.id !== user.id && (
                  <IconButton
                    aria-label="Remove user" variant="ghost" size="sm"
                    color="gray.400" _hover={{ color: 'red.500', bg: 'red.50' }}
                    onClick={() => handleDeleteUser(u.id, u.name)}
                  >
                    <FiTrash2 />
                  </IconButton>
                )}
              </HStack>
            </Flex>
          ))}
        </VStack>

        <Separator mb={10} />

        {/* Categories section */}
        <Flex justify="space-between" align="center" mb={4}>
          <Box>
            <Heading size="lg" color="gray.800">Categories</Heading>
            <Text fontSize="sm" color="gray.500" mt={1}>{categories.length} categories</Text>
          </Box>
          <Button colorPalette="teal" size="sm" onClick={() => setShowAddCategory(true)}>
            <FiPlus />
            Add Category
          </Button>
        </Flex>

        <VStack gap={2} align="stretch">
          {categories.map((c) => (
            <Flex
              key={c.id}
              p={3}
              bg="white"
              borderWidth="1px"
              borderRadius="xl"
              borderColor="gray.100"
              align="center"
              justify="space-between"
            >
              <HStack gap={3}>
                <Text fontSize="xl" w="32px" textAlign="center">{c.emoji}</Text>
                <Text fontSize="sm" fontWeight="medium">{c.name}</Text>
              </HStack>
              <IconButton
                aria-label="Delete category" variant="ghost" size="sm"
                color="gray.400" _hover={{ color: 'red.500', bg: 'red.50' }}
                onClick={() => handleDeleteCategory(c.id, c.name)}
              >
                <FiTrash2 />
              </IconButton>
            </Flex>
          ))}
        </VStack>
      </Box>

      <AddUserModal
        open={showAddUser}
        onClose={() => setShowAddUser(false)}
        onAdded={fetchData}
      />
      <AddCategoryModal
        open={showAddCategory}
        onClose={() => setShowAddCategory(false)}
        onAdded={fetchData}
      />
      <EditEmailModal
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSaved={fetchData}
      />
    </>
  )
}

// ── Add User modal ──────────────────────────────────────────────────────────

function AddUserModal({ open, onClose, onAdded }: { open: boolean; onClose: () => void; onAdded: () => void }) {
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const reset = () => { setName(''); setMobile(''); setPassword(''); setEmail('') }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await postAPICall('/api/admin/users', { name, mobile, password, email: email || undefined })
      toaster.create({ title: `${name} added`, type: 'success', duration: 3000 })
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
              <Input placeholder="e.g. Jane Doe" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            </Box>
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={1} color="gray.700">Mobile Number</Text>
              <Input placeholder="e.g. 91234567" value={mobile} onChange={(e) => setMobile(e.target.value)} type="tel" maxLength={8} />
              <Text fontSize="xs" color="gray.400" mt={1}>8-digit number starting with 8 or 9</Text>
            </Box>
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={1} color="gray.700">Temporary Password</Text>
              <PasswordInput
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Text fontSize="xs" color="gray.400" mt={1}>Share this with the user.</Text>
            </Box>
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={1} color="gray.700">Google Account Email <Text as="span" color="gray.400">(optional)</Text></Text>
              <Input
                placeholder="e.g. jane@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
                type="email"
              />
              <Text fontSize="xs" color="gray.400" mt={1}>Allows this user to sign in with Google.</Text>
            </Box>
          </VStack>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} mr={2}>Cancel</Button>
          <Button colorPalette="teal" onClick={handleSubmit} loading={loading}>Add User</Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  )
}

// ── Add Category modal ──────────────────────────────────────────────────────

function AddCategoryModal({ open, onClose, onAdded }: { open: boolean; onClose: () => void; onAdded: () => void }) {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('')
  const [loading, setLoading] = useState(false)

  const reset = () => { setName(''); setEmoji('') }

  const handleSubmit = async () => {
    if (!name.trim() || !emoji.trim()) {
      toaster.create({ title: 'Name and emoji are required', type: 'error', duration: 3000 })
      return
    }
    setLoading(true)
    try {
      await postAPICall('/api/admin/categories', { name: name.trim(), emoji: emoji.trim() })
      toaster.create({ title: `"${name}" added`, type: 'success', duration: 3000 })
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
          <DialogTitle>Add Category</DialogTitle>
          <DialogCloseTrigger />
        </DialogHeader>
        <DialogBody>
          <VStack gap={4} align="stretch">
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={1} color="gray.700">Category Name</Text>
              <Input placeholder="e.g. Hobbies" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            </Box>
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={1} color="gray.700">Emoji</Text>
              <Input
                placeholder="e.g. 🎨"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
                maxLength={4}
                fontSize="xl"
              />
            </Box>
          </VStack>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} mr={2}>Cancel</Button>
          <Button colorPalette="teal" onClick={handleSubmit} loading={loading}>Add Category</Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  )
}

// ── Edit Email Modal ──────────────────────────────────────────────────────────

function EditEmailModal({ user, onClose, onSaved }: { user: UserRow | null; onClose: () => void; onSaved: () => void }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) setEmail(user.email || '')
  }, [user])

  const handleSave = async () => {
    if (!user) return
    setLoading(true)
    try {
      await patchAPICall('/api/admin/users', { userId: user.id, email: email.trim() || null })
      toaster.create({ title: 'Email updated', type: 'success', duration: 3000 })
      onSaved()
      onClose()
    } catch (err) {
      toaster.create({ title: String(err), type: 'error', duration: 4000 })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DialogRoot open={!!user} onOpenChange={(e) => { if (!e.open) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Link Google Account — {user?.name}</DialogTitle>
          <DialogCloseTrigger />
        </DialogHeader>
        <DialogBody>
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={1} color="gray.700">Google Account Email</Text>
            <Input
              placeholder="e.g. jane@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
              type="email"
              autoFocus
            />
            <Text fontSize="xs" color="gray.400" mt={1}>Leave blank to unlink Google sign-in.</Text>
          </Box>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} mr={2}>Cancel</Button>
          <Button colorPalette="teal" onClick={handleSave} loading={loading}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  )
}
