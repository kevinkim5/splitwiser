import { useEffect, useState } from 'react'
import {
  Box,
  Input,
  VStack,
  Text,
  HStack,
  Select,
  createListCollection,
  Portal,
  SimpleGrid,
} from '@chakra-ui/react'
import { Button } from '@/components/ui/button'
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogCloseTrigger,
} from '@/components/ui/dialog'
import { getAPICall, putAPICall, deleteAPICall } from '@/utils/apiManager'
import { toaster } from '@/components/ui/toaster'
import { Category, Expense, GroupMember } from '@/types'

interface EditExpenseModalProps {
  expense: Expense | null
  onClose: () => void
  onSaved: () => void
  groupId: string
  members: GroupMember[]
}

export default function EditExpenseModal({
  expense,
  onClose,
  onSaved,
  groupId,
  members,
}: EditExpenseModalProps) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [paidById, setPaidById] = useState('')
  const [date, setDate] = useState('')
  const [splitType, setSplitType] = useState('equal')
  const [exactSplits, setExactSplits] = useState<Record<string, string>>({})
  const [percentageSplits, setPercentageSplits] = useState<Record<string, string>>({})
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (expense) {
      setDescription(expense.description)
      setAmount(String(expense.amount))
      setPaidById(expense.paid_by_id)
      setDate(new Date(expense.date).toISOString().split('T')[0])
      setSplitType(expense.split_type)
      setCategoryId(expense.category_id ?? null)
      const splits: Record<string, string> = {}
      expense.splits.forEach((s) => { splits[s.user_id] = String(s.amount) })
      setExactSplits(splits)
      setPercentageSplits({})
      setConfirmDelete(false)
    }
  }, [expense])

  useEffect(() => {
    if (expense && categories.length === 0) {
      getAPICall('/api/categories').then((data) => { if (data) setCategories(data) })
    }
  }, [expense, categories.length])

  const memberCollection = createListCollection({
    items: members.map((m) => ({ label: m.name, value: m.userId })),
  })

  const splitTypeCollection = createListCollection({
    items: [
      { label: 'Split Equally', value: 'equal' },
      { label: 'Exact Amounts', value: 'exact' },
      { label: 'By Percentage', value: 'percentage' },
    ],
  })

  const handleSave = async () => {
    if (!expense) return
    if (!description.trim()) {
      toaster.create({ title: 'Description is required', type: 'error', duration: 3000 })
      return
    }
    const amt = parseFloat(amount)
    if (isNaN(amt) || amt <= 0) {
      toaster.create({ title: 'Enter a valid amount', type: 'error', duration: 3000 })
      return
    }

    const payload: Record<string, unknown> = {
      description: description.trim(),
      amount: amt,
      paid_by_id: paidById,
      date,
      split_type: splitType,
      category_id: categoryId,
    }

    if (splitType === 'exact') {
      payload.splits = members.map((m) => ({
        user_id: m.userId,
        amount: parseFloat(exactSplits[m.userId] || '0'),
      }))
      const total = (payload.splits as { amount: number }[]).reduce((s, x) => s + x.amount, 0)
      if (Math.abs(total - amt) > 0.01) {
        toaster.create({ title: `Splits must add up to $${amt.toFixed(2)}`, type: 'error', duration: 4000 })
        return
      }
    }

    if (splitType === 'percentage') {
      payload.splits = members.map((m) => ({
        user_id: m.userId,
        percentage: parseFloat(percentageSplits[m.userId] || '0'),
      }))
      const total = (payload.splits as { percentage: number }[]).reduce((s, x) => s + x.percentage, 0)
      if (Math.abs(total - 100) > 0.01) {
        toaster.create({ title: 'Percentages must add up to 100%', type: 'error', duration: 4000 })
        return
      }
    }

    setLoading(true)
    try {
      await putAPICall(`/api/groups/${groupId}/expenses/${expense.id}`, payload)
      toaster.create({ title: 'Expense updated', type: 'success', duration: 3000 })
      onSaved()
      onClose()
    } catch (err) {
      toaster.create({ title: String(err), type: 'error', duration: 4000 })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!expense) return
    setDeleting(true)
    try {
      await deleteAPICall(`/api/groups/${groupId}/expenses/${expense.id}`)
      toaster.create({ title: 'Expense deleted', type: 'info', duration: 3000 })
      onSaved()
      onClose()
    } catch (err) {
      toaster.create({ title: String(err), type: 'error', duration: 4000 })
    } finally {
      setDeleting(false)
    }
  }

  const percentageTotal = members.reduce((s, m) => s + parseFloat(percentageSplits[m.userId] || '0'), 0)

  return (
    <DialogRoot open={!!expense} onOpenChange={(e) => { if (!e.open) { setConfirmDelete(false); onClose() } }} size="md">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Expense</DialogTitle>
          <DialogCloseTrigger />
        </DialogHeader>
        <DialogBody>
          <VStack gap={4} align="stretch">
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={1} color="gray.700">Description</Text>
              <Input
                placeholder="e.g. Dinner, Taxi, Groceries"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                autoFocus
              />
            </Box>

            <HStack gap={3}>
              <Box flex={1}>
                <Text fontSize="sm" fontWeight="medium" mb={1} color="gray.700">Amount ($)</Text>
                <Input
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  type="text"
                  inputMode="decimal"
                />
              </Box>
              <Box flex={1}>
                <Text fontSize="sm" fontWeight="medium" mb={1} color="gray.700">Date</Text>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </Box>
            </HStack>

            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.700">Category</Text>
              <SimpleGrid columns={4} gap={2}>
                {categories.map((c) => (
                  <Box
                    key={c.id}
                    p={2}
                    borderRadius="lg"
                    borderWidth="1.5px"
                    borderColor={categoryId === c.id ? 'teal.400' : 'gray.100'}
                    bg={categoryId === c.id ? 'teal.50' : 'white'}
                    cursor="pointer"
                    textAlign="center"
                    _hover={{ borderColor: 'teal.300', bg: 'teal.50' }}
                    onClick={() => setCategoryId(categoryId === c.id ? null : c.id)}
                  >
                    <Text fontSize="xl" lineHeight={1}>{c.emoji}</Text>
                    <Text fontSize="10px" color="gray.600" mt={1} lineHeight={1.2} lineClamp={2}>{c.name}</Text>
                  </Box>
                ))}
              </SimpleGrid>
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={1} color="gray.700">Paid by</Text>
              <Select.Root
                collection={memberCollection}
                value={[paidById]}
                onValueChange={(e) => setPaidById(e.value[0])}
                size="md"
              >
                <Select.Trigger>
                  <Select.ValueText placeholder="Select who paid" />
                </Select.Trigger>
                <Portal>
                  <Select.Positioner>
                    <Select.Content>
                      {memberCollection.items.map((item) => (
                        <Select.Item key={item.value} item={item}>
                          {item.label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Portal>
              </Select.Root>
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={1} color="gray.700">Split</Text>
              <Select.Root
                collection={splitTypeCollection}
                value={[splitType]}
                onValueChange={(e) => setSplitType(e.value[0])}
                size="md"
              >
                <Select.Trigger>
                  <Select.ValueText />
                </Select.Trigger>
                <Portal>
                  <Select.Positioner>
                    <Select.Content>
                      {splitTypeCollection.items.map((item) => (
                        <Select.Item key={item.value} item={item}>
                          {item.label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Portal>
              </Select.Root>
            </Box>

            {splitType === 'exact' && (
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.700">
                  Enter each person&apos;s share
                </Text>
                <VStack gap={2}>
                  {members.map((m) => (
                    <HStack key={m.userId} justify="space-between">
                      <Text fontSize="sm" flex={1}>{m.name}</Text>
                      <Input
                        w="120px"
                        size="sm"
                        placeholder="0.00"
                        type="text"
                        inputMode="decimal"
                        value={exactSplits[m.userId] || ''}
                        onChange={(e) =>
                          setExactSplits((prev) => ({ ...prev, [m.userId]: e.target.value }))
                        }
                      />
                    </HStack>
                  ))}
                </VStack>
                {amount && (
                  <Text fontSize="xs" color="gray.500" mt={2}>
                    Total must equal ${parseFloat(amount || '0').toFixed(2)}
                    {' — '}remaining: ${(
                      parseFloat(amount || '0') -
                      members.reduce((s, m) => s + parseFloat(exactSplits[m.userId] || '0'), 0)
                    ).toFixed(2)}
                  </Text>
                )}
              </Box>
            )}

            {splitType === 'percentage' && (
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.700">
                  Enter each person&apos;s percentage
                </Text>
                <VStack gap={2}>
                  {members.map((m) => (
                    <HStack key={m.userId} justify="space-between">
                      <Text fontSize="sm" flex={1}>{m.name}</Text>
                      <HStack gap={1}>
                        <Input
                          w="90px"
                          size="sm"
                          placeholder="0"
                          type="text"
                          inputMode="decimal"
                          value={percentageSplits[m.userId] || ''}
                          onChange={(e) =>
                            setPercentageSplits((prev) => ({ ...prev, [m.userId]: e.target.value }))
                          }
                        />
                        <Text fontSize="sm" color="gray.500">%</Text>
                      </HStack>
                    </HStack>
                  ))}
                </VStack>
                <Text fontSize="xs" color={Math.abs(percentageTotal - 100) < 0.01 ? 'green.600' : 'gray.500'} mt={2}>
                  Total: {percentageTotal.toFixed(1)}% {Math.abs(percentageTotal - 100) < 0.01 ? '✓' : '(must equal 100%)'}
                </Text>
              </Box>
            )}

            {splitType === 'equal' && amount && members.length > 0 && (
              <Box p={3} bg="teal.50" borderRadius="md">
                <Text fontSize="sm" color="teal.700">
                  Each person pays <Text as="span" fontWeight="bold">${(parseFloat(amount) / members.length).toFixed(2)}</Text>
                </Text>
              </Box>
            )}

            {/* Delete section */}
            {!confirmDelete ? (
              <Box pt={2} borderTopWidth="1px" borderColor="gray.100">
                <Button variant="ghost" colorPalette="red" size="sm" w="full" onClick={() => setConfirmDelete(true)}>
                  Delete Expense
                </Button>
              </Box>
            ) : (
              <Box p={3} bg="red.50" borderRadius="md" borderWidth="1px" borderColor="red.200">
                <Text fontSize="sm" fontWeight="medium" color="red.700" mb={3}>
                  Are you sure? This cannot be undone.
                </Text>
                <HStack gap={2}>
                  <Button variant="outline" size="sm" flex={1} onClick={() => setConfirmDelete(false)}>Cancel</Button>
                  <Button colorPalette="red" size="sm" flex={1} onClick={handleDelete} loading={deleting}>Yes, Delete</Button>
                </HStack>
              </Box>
            )}
          </VStack>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} mr={2}>Cancel</Button>
          <Button colorPalette="teal" onClick={handleSave} loading={loading}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  )
}
