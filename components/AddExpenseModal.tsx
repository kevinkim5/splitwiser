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
import { getAPICall, postAPICall } from '@/utils/apiManager'
import { toaster } from '@/components/ui/toaster'
import { Category, GroupMember } from '@/types'
import { useAuth } from '@/contexts/AuthContext'

interface AddExpenseModalProps {
  open: boolean
  onClose: () => void
  onAdded: () => void
  groupId: string
  members: GroupMember[]
}

export default function AddExpenseModal({
  open,
  onClose,
  onAdded,
  groupId,
  members,
}: AddExpenseModalProps) {
  const { user } = useAuth()
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [paidById, setPaidById] = useState(user?.id || '')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [splitType, setSplitType] = useState('equal')
  const [exactSplits, setExactSplits] = useState<Record<string, string>>({})
  const [percentageSplits, setPercentageSplits] = useState<Record<string, string>>({})
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && categories.length === 0) {
      getAPICall('/api/categories').then((data) => { if (data) setCategories(data) })
    }
  }, [open, categories.length])

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

  const reset = () => {
    setDescription('')
    setAmount('')
    setPaidById(user?.id || '')
    setDate(new Date().toISOString().split('T')[0])
    setSplitType('equal')
    setExactSplits({})
    setPercentageSplits({})
    setCategoryId(null)
  }

  const handleSubmit = async () => {
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
      await postAPICall(`/api/groups/${groupId}/expenses`, payload)
      toaster.create({ title: 'Expense added!', type: 'success', duration: 3000 })
      reset()
      onAdded()
      onClose()
    } catch (err) {
      toaster.create({ title: String(err), type: 'error', duration: 4000 })
    } finally {
      setLoading(false)
    }
  }

  const percentageTotal = members.reduce((s, m) => s + parseFloat(percentageSplits[m.userId] || '0'), 0)

  return (
    <DialogRoot open={open} onOpenChange={(e) => { if (!e.open) { reset(); onClose() } }} size="md">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
          <DialogCloseTrigger />
        </DialogHeader>
        <DialogBody>
          <VStack gap={4} align="stretch">
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={1} color="fg.label">Description</Text>
              <Input
                placeholder="e.g. Dinner, Taxi, Groceries"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                autoFocus
              />
            </Box>

            <HStack gap={3}>
              <Box flex={1}>
                <Text fontSize="sm" fontWeight="medium" mb={1} color="fg.label">Amount ($)</Text>
                <Input
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  type="text"
                  inputMode="decimal"
                />
              </Box>
              <Box flex={1}>
                <Text fontSize="sm" fontWeight="medium" mb={1} color="fg.label">Date</Text>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </Box>
            </HStack>

            {/* Category picker */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2} color="fg.label">Category</Text>
              <SimpleGrid columns={4} gap={2}>
                {categories.map((c) => (
                  <Box
                    key={c.id}
                    p={2}
                    borderRadius="lg"
                    borderWidth="1.5px"
                    borderColor={categoryId === c.id ? 'teal.400' : 'border.card'}
                    bg={categoryId === c.id ? 'teal.chip' : 'bg.panel'}
                    cursor="pointer"
                    textAlign="center"
                    _hover={{ borderColor: 'teal.300', bg: 'teal.chip' }}
                    onClick={() => setCategoryId(categoryId === c.id ? null : c.id)}
                  >
                    <Text fontSize="xl" lineHeight={1}>{c.emoji}</Text>
                    <Text fontSize="10px" color="fg.muted" mt={1} lineHeight={1.2} lineClamp={2}>{c.name}</Text>
                  </Box>
                ))}
              </SimpleGrid>
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={1} color="fg.label">Paid by</Text>
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
              <Text fontSize="sm" fontWeight="medium" mb={1} color="fg.label">Split</Text>
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
                <Text fontSize="sm" fontWeight="medium" mb={2} color="fg.label">
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
                  <Text fontSize="xs" color="fg.muted" mt={2}>
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
                <Text fontSize="sm" fontWeight="medium" mb={2} color="fg.label">
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
                        <Text fontSize="sm" color="fg.muted">%</Text>
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
              <Box p={3} bg="teal.chip" borderRadius="md">
                <Text fontSize="sm" color="teal.700" _dark={{ color: 'teal.200' }}>
                  Each person pays <Text as="span" fontWeight="bold">${(parseFloat(amount) / members.length).toFixed(2)}</Text>
                </Text>
              </Box>
            )}
          </VStack>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => { reset(); onClose() }} mr={2}>Cancel</Button>
          <Button colorPalette="teal" onClick={handleSubmit} loading={loading}>
            Add Expense
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  )
}
