import { useState } from 'react'
import {
  Box,
  Input,
  VStack,
  Text,
  HStack,
  Select,
  createListCollection,
  Portal,
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
import { postAPICall } from '@/utils/apiManager'
import { toaster } from '@/components/ui/toaster'
import { GroupMember } from '@/types'
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
  const [loading, setLoading] = useState(false)

  const memberCollection = createListCollection({
    items: members.map((m) => ({ label: m.name, value: m.userId })),
  })

  const splitTypeCollection = createListCollection({
    items: [
      { label: 'Split Equally', value: 'equal' },
      { label: 'Exact Amounts', value: 'exact' },
    ],
  })

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

    setLoading(true)
    try {
      await postAPICall(`/api/groups/${groupId}/expenses`, payload)
      toaster.create({ title: 'Expense added!', type: 'success', duration: 3000 })
      setDescription('')
      setAmount('')
      setPaidById(user?.id || '')
      setDate(new Date().toISOString().split('T')[0])
      setSplitType('equal')
      setExactSplits({})
      onAdded()
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
          <DialogTitle>Add Expense</DialogTitle>
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
                  type="number"
                  min={0}
                  step={0.01}
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
                        type="number"
                        min={0}
                        step={0.01}
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

            {splitType === 'equal' && amount && members.length > 0 && (
              <Box p={3} bg="teal.50" borderRadius="md">
                <Text fontSize="sm" color="teal.700">
                  Each person pays <Text as="span" fontWeight="bold">${(parseFloat(amount) / members.length).toFixed(2)}</Text>
                </Text>
              </Box>
            )}
          </VStack>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} mr={2}>Cancel</Button>
          <Button colorPalette="teal" onClick={handleSubmit} loading={loading}>
            Add Expense
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  )
}
