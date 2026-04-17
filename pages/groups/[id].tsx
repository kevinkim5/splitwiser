import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import {
  Box,
  Flex,
  HStack,
  Heading,
  IconButton,
  Input,
  Spinner,
  Tabs,
  Text,
  VStack,
  Badge,
} from '@chakra-ui/react'
import { Button } from '@/components/ui/button'
import { FiArrowLeft, FiPlus, FiUsers, FiDollarSign, FiBarChart2, FiSearch } from 'react-icons/fi'
import { getAPICall, deleteAPICall, postAPICall } from '@/utils/apiManager'
import { toaster } from '@/components/ui/toaster'
import { Toaster } from '@/components/ui/toaster'
import { Expense, Group, GroupMember, Settlement, Balance, SimplifiedDebt } from '@/types'
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogCloseTrigger,
} from '@/components/ui/dialog'
import AddExpenseModal from '@/components/AddExpenseModal'
import SettleUpModal from '@/components/SettleUpModal'
import BalanceSummary from '@/components/BalanceSummary'
import ExpenseItem from '@/components/ExpenseItem'
import { useAuth } from '@/contexts/AuthContext'
import dayjs from 'dayjs'

type ActiveTab = 'expenses' | 'balances' | 'members'

export default function GroupDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const { user } = useAuth()

  const [group, setGroup] = useState<Group | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [balances, setBalances] = useState<Balance[]>([])
  const [simplified, setSimplified] = useState<SimplifiedDebt[]>([])
  const [tab, setTab] = useState<ActiveTab>('expenses')
  const [loading, setLoading] = useState(true)
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [showSettleUp, setShowSettleUp] = useState(false)
  const [showAddMember, setShowAddMember] = useState(false)
  const [selectedDebt, setSelectedDebt] = useState<SimplifiedDebt | null>(null)

  const fetchAll = useCallback(async () => {
    if (!id) return
    setLoading(true)
    const [groupData, expensesData, settlementsData, balancesData] = await Promise.all([
      getAPICall(`/api/groups/${id}`),
      getAPICall(`/api/groups/${id}/expenses`),
      getAPICall(`/api/groups/${id}/settlements`),
      getAPICall(`/api/groups/${id}/balances`),
    ])
    if (groupData) setGroup(groupData)
    if (expensesData) setExpenses(expensesData)
    if (settlementsData) setSettlements(settlementsData)
    if (balancesData) {
      setBalances(balancesData.balances || [])
      setSimplified(balancesData.simplified || [])
    }
    setLoading(false)
  }, [id])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      await deleteAPICall(`/api/groups/${id}/expenses/${expenseId}`)
      toaster.create({ title: 'Expense deleted', type: 'info', duration: 3000 })
      fetchAll()
    } catch (err) {
      toaster.create({ title: String(err), type: 'error', duration: 4000 })
    }
  }

  const handleSettleUp = (debt?: SimplifiedDebt) => {
    setSelectedDebt(debt || null)
    setShowSettleUp(true)
  }

  const myBalance = balances.find((b) => b.userId === user?.id)

  if (loading) {
    return (
      <Flex justify="center" align="center" h="60vh">
        <Spinner color="teal.500" size="lg" />
      </Flex>
    )
  }

  if (!group) {
    return (
      <Box textAlign="center" py={16}>
        <Text color="gray.500">Group not found</Text>
      </Box>
    )
  }

  return (
    <>
      <Toaster />
      <Box maxW="lg" mx="auto" pb={8}>
        {/* Header */}
        <Box bg="teal.600" px={4} pt={4} pb={6} mx={-4} mb={0}>
          <HStack gap={3} mb={4}>
            <IconButton
              aria-label="Back"
              variant="ghost"
              color="white"
              size="sm"
              _hover={{ bg: 'teal.700' }}
              onClick={() => router.push('/groups')}
            >
              <FiArrowLeft />
            </IconButton>
            <Box flex={1}>
              <Heading size="lg" color="white">{group.name}</Heading>
              <Text fontSize="sm" color="teal.100">
                {group.members.length} member{group.members.length !== 1 ? 's' : ''}
              </Text>
            </Box>
          </HStack>

          {/* Balance chip */}
          {myBalance && Math.abs(myBalance.amount) > 0.01 && (
            <Box
              bg="white"
              borderRadius="xl"
              p={3}
              mx={2}
              mt={2}
            >
              <Flex justify="space-between" align="center">
                <Text fontSize="sm" color="gray.600">
                  {myBalance.amount > 0
                    ? 'Others owe you'
                    : 'You owe'}
                </Text>
                <Text
                  fontWeight="bold"
                  fontSize="lg"
                  color={myBalance.amount > 0 ? 'green.600' : 'orange.500'}
                >
                  ${Math.abs(myBalance.amount).toFixed(2)}
                </Text>
              </Flex>
            </Box>
          )}
          {myBalance && Math.abs(myBalance.amount) <= 0.01 && (
            <Box bg="white" borderRadius="xl" p={3} mx={2} mt={2}>
              <Text fontSize="sm" color="green.600" fontWeight="medium" textAlign="center">
                ✓ All settled up!
              </Text>
            </Box>
          )}
        </Box>

        {/* Action buttons */}
        <HStack gap={2} px={4} py={3} bg="white" borderBottomWidth="1px" borderColor="gray.100">
          <Button
            flex={1}
            colorPalette="teal"
            size="sm"
            onClick={() => setShowAddExpense(true)}
          >
            <FiPlus />
            Add Expense
          </Button>
          <Button
            flex={1}
            variant="outline"
            colorPalette="teal"
            size="sm"
            onClick={() => handleSettleUp()}
          >
            <FiDollarSign />
            Settle Up
          </Button>
        </HStack>

        {/* Tabs */}
        <Tabs.Root
          value={tab}
          onValueChange={(e) => setTab(e.value as ActiveTab)}
          px={4}
          pt={4}
        >
          <Tabs.List borderBottomWidth="1px" borderColor="gray.100">
            <Tabs.Trigger value="expenses" flex={1} justifyContent="center">
              <HStack gap={1}>
                <FiBarChart2 size={14} />
                <Text fontSize="sm">Expenses</Text>
                {expenses.length > 0 && (
                  <Badge colorPalette="teal" variant="solid" size="sm" borderRadius="full">
                    {expenses.length}
                  </Badge>
                )}
              </HStack>
            </Tabs.Trigger>
            <Tabs.Trigger value="balances" flex={1} justifyContent="center">
              <HStack gap={1}>
                <FiDollarSign size={14} />
                <Text fontSize="sm">Balances</Text>
              </HStack>
            </Tabs.Trigger>
            <Tabs.Trigger value="members" flex={1} justifyContent="center">
              <HStack gap={1}>
                <FiUsers size={14} />
                <Text fontSize="sm">Members</Text>
              </HStack>
            </Tabs.Trigger>
          </Tabs.List>

          {/* Expenses Tab */}
          <Tabs.Content value="expenses" pt={4}>
            {expenses.length === 0 && settlements.length === 0 ? (
              <Box textAlign="center" py={12}>
                <Text fontSize="3xl" mb={3}>💸</Text>
                <Text fontWeight="semibold" color="gray.700" mb={1}>No expenses yet</Text>
                <Text fontSize="sm" color="gray.500" mb={4}>Add your first expense to get started</Text>
                <Button colorPalette="teal" size="sm" onClick={() => setShowAddExpense(true)}>
                  <FiPlus />
                  Add Expense
                </Button>
              </Box>
            ) : (
              <VStack gap={3} align="stretch">
                {/* Expenses */}
                {expenses.map((e) => (
                  <ExpenseItem key={e.id} expense={e} onDelete={handleDeleteExpense} />
                ))}

                {/* Settlements */}
                {settlements.map((s) => (
                  <Box
                    key={s.id}
                    p={4}
                    borderWidth="1px"
                    borderRadius="lg"
                    bg="green.50"
                    borderColor="green.100"
                  >
                    <Flex justify="space-between" align="center">
                      <HStack gap={3}>
                        <Box
                          w="40px"
                          h="40px"
                          borderRadius="lg"
                          bg="green.100"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Text fontSize="lg">✅</Text>
                        </Box>
                        <Box>
                          <Text fontWeight="semibold" fontSize="sm" color="gray.800">
                            {s.payer?.name ?? 'Someone'} paid {s.receiver?.name ?? 'someone'}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            Settlement · {dayjs(s.date).format('MMM D, YYYY')}
                            {s.note && ` · ${s.note}`}
                          </Text>
                        </Box>
                      </HStack>
                      <Text fontWeight="bold" fontSize="sm" color="green.700">
                        ${Number(s.amount).toFixed(2)}
                      </Text>
                    </Flex>
                  </Box>
                ))}
              </VStack>
            )}
          </Tabs.Content>

          {/* Balances Tab */}
          <Tabs.Content value="balances" pt={4}>
            <BalanceSummary
              balances={balances}
              simplified={simplified}
              onSettleUp={handleSettleUp}
            />
          </Tabs.Content>

          {/* Members Tab */}
          <Tabs.Content value="members" pt={4}>
            <Flex justify="flex-end" mb={3}>
              <Button colorPalette="teal" size="sm" onClick={() => setShowAddMember(true)}>
                <FiPlus />
                Add Member
              </Button>
            </Flex>
            <VStack gap={2} align="stretch">
              {group.members.map((m) => (
                <Flex
                  key={m.userId}
                  p={3}
                  borderRadius="lg"
                  bg="white"
                  borderWidth="1px"
                  borderColor="gray.100"
                  align="center"
                  justify="space-between"
                >
                  <HStack gap={3}>
                    <Box
                      w="38px"
                      h="38px"
                      borderRadius="full"
                      bg="teal.100"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text fontWeight="bold" color="teal.700" fontSize="sm">
                        {m.name.charAt(0).toUpperCase()}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" fontWeight="medium">
                        {m.name} {m.userId === user?.id && <Text as="span" color="gray.400">(you)</Text>}
                      </Text>
                      <Text fontSize="xs" color="gray.500">{m.mobile}</Text>
                    </Box>
                  </HStack>
                  {(() => {
                    const b = balances.find((x) => x.userId === m.userId)
                    if (!b || Math.abs(b.amount) < 0.01) {
                      return <Badge colorPalette="green" variant="subtle" size="sm">settled</Badge>
                    }
                    return (
                      <Text
                        fontSize="sm"
                        fontWeight="semibold"
                        color={b.amount > 0 ? 'green.600' : 'orange.500'}
                      >
                        {b.amount > 0 ? `+$${b.amount.toFixed(2)}` : `-$${Math.abs(b.amount).toFixed(2)}`}
                      </Text>
                    )
                  })()}
                </Flex>
              ))}
            </VStack>
          </Tabs.Content>
        </Tabs.Root>
      </Box>

      {/* Modals */}
      {group && (
        <>
          <AddExpenseModal
            open={showAddExpense}
            onClose={() => setShowAddExpense(false)}
            onAdded={fetchAll}
            groupId={group.id}
            members={group.members}
          />
          <SettleUpModal
            open={showSettleUp}
            onClose={() => { setShowSettleUp(false); setSelectedDebt(null) }}
            onSettled={fetchAll}
            groupId={group.id}
            members={group.members}
            suggested={selectedDebt}
          />
          <AddMemberModal
            open={showAddMember}
            onClose={() => setShowAddMember(false)}
            onAdded={fetchAll}
            groupId={group.id}
            existingMembers={group.members}
          />
        </>
      )}
    </>
  )
}

// ── Add Member Modal ──────────────────────────────────────────────────────────

interface AddMemberModalProps {
  open: boolean
  onClose: () => void
  onAdded: () => void
  groupId: string
  existingMembers: GroupMember[]
}

function AddMemberModal({ open, onClose, onAdded, groupId, existingMembers }: AddMemberModalProps) {
  const [allUsers, setAllUsers] = useState<{ id: string; name: string; mobile: string }[]>([])
  const [search, setSearch] = useState('')
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      getAPICall('/api/users').then((data) => { if (data) setAllUsers(data) })
    }
  }, [open])

  const existingIds = new Set(existingMembers.map((m) => m.userId))
  const candidates = allUsers.filter(
    (u) => !existingIds.has(u.id) &&
      (u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.mobile.includes(search))
  )

  const reset = () => { setSearch(''); setSelectedUserId(null) }

  const handleAdd = async () => {
    if (!selectedUserId) return
    setLoading(true)
    try {
      await postAPICall(`/api/groups/${groupId}/members`, { userId: selectedUserId })
      toaster.create({ title: 'Member added', type: 'success', duration: 3000 })
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
    <DialogRoot open={open} onOpenChange={(e) => { if (!e.open) { reset(); onClose() } }} size="sm">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Member</DialogTitle>
          <DialogCloseTrigger />
        </DialogHeader>
        <DialogBody>
          <Box mb={3} position="relative">
            <Box position="absolute" left={3} top="50%" transform="translateY(-50%)" color="gray.400" pointerEvents="none">
              <FiSearch size={14} />
            </Box>
            <Input
              pl={8}
              placeholder="Search by name or mobile"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </Box>
          <VStack gap={1} align="stretch" maxH="300px" overflowY="auto">
            {candidates.length === 0 && (
              <Text fontSize="sm" color="gray.400" textAlign="center" py={4}>
                {allUsers.length === 0 ? 'Loading…' : 'No users available to add'}
              </Text>
            )}
            {candidates.map((u) => (
              <Flex
                key={u.id}
                p={3}
                borderRadius="lg"
                borderWidth="1.5px"
                borderColor={selectedUserId === u.id ? 'teal.400' : 'gray.100'}
                bg={selectedUserId === u.id ? 'teal.50' : 'white'}
                cursor="pointer"
                align="center"
                gap={3}
                _hover={{ borderColor: 'teal.300', bg: 'teal.50' }}
                onClick={() => setSelectedUserId(selectedUserId === u.id ? null : u.id)}
              >
                <Box
                  w="36px" h="36px" borderRadius="full" bg="teal.100"
                  display="flex" alignItems="center" justifyContent="center" flexShrink={0}
                >
                  <Text fontWeight="bold" color="teal.700" fontSize="sm">{u.name.charAt(0).toUpperCase()}</Text>
                </Box>
                <Box flex={1}>
                  <Text fontSize="sm" fontWeight="medium">{u.name}</Text>
                  <Text fontSize="xs" color="gray.500">{u.mobile}</Text>
                </Box>
              </Flex>
            ))}
          </VStack>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => { reset(); onClose() }} mr={2}>Cancel</Button>
          <Button colorPalette="teal" onClick={handleAdd} loading={loading} disabled={!selectedUserId}>
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  )
}
