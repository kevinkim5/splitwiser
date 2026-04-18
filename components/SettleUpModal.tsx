import { useState } from 'react'
import {
  Box,
  Input,
  VStack,
  Text,
  Select,
  Portal,
  createListCollection,
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
import { GroupMember, SimplifiedDebt } from '@/types'
import { useAuth } from '@/contexts/AuthContext'

interface SettleUpModalProps {
  open: boolean
  onClose: () => void
  onSettled: () => void
  groupId: string
  members: GroupMember[]
  suggested?: SimplifiedDebt | null
}

export default function SettleUpModal({
  open,
  onClose,
  onSettled,
  groupId,
  members,
  suggested,
}: SettleUpModalProps) {
  const { user } = useAuth()
  const [payerId, setPayerId] = useState(suggested?.from || user?.id || '')
  const [receiverId, setReceiverId] = useState(suggested?.to || '')
  const [amount, setAmount] = useState(suggested?.amount?.toFixed(2) || '')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  const memberCollection = createListCollection({
    items: members.map((m) => ({ label: m.name, value: m.userId })),
  })

  const handleSubmit = async () => {
    const amt = parseFloat(amount)
    if (!payerId || !receiverId) {
      toaster.create({ title: 'Select payer and receiver', type: 'error', duration: 3000 })
      return
    }
    if (payerId === receiverId) {
      toaster.create({ title: 'Payer and receiver must be different', type: 'error', duration: 3000 })
      return
    }
    if (isNaN(amt) || amt <= 0) {
      toaster.create({ title: 'Enter a valid amount', type: 'error', duration: 3000 })
      return
    }

    setLoading(true)
    try {
      await postAPICall(`/api/groups/${groupId}/settlements`, {
        payer_id: payerId,
        receiver_id: receiverId,
        amount: amt,
        date,
        note: note.trim() || undefined,
      })
      toaster.create({ title: 'Settlement recorded!', type: 'success', duration: 3000 })
      setNote('')
      onSettled()
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
          <DialogTitle>Settle Up</DialogTitle>
          <DialogCloseTrigger />
        </DialogHeader>
        <DialogBody>
          <VStack gap={4} align="stretch">
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={1} color="fg.label">Who is paying?</Text>
              <Select.Root
                collection={memberCollection}
                value={[payerId]}
                onValueChange={(e) => setPayerId(e.value[0])}
                size="md"
              >
                <Select.Trigger>
                  <Select.ValueText placeholder="Select payer" />
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
              <Text fontSize="sm" fontWeight="medium" mb={1} color="fg.label">Who are they paying?</Text>
              <Select.Root
                collection={memberCollection}
                value={[receiverId]}
                onValueChange={(e) => setReceiverId(e.value[0])}
                size="md"
              >
                <Select.Trigger>
                  <Select.ValueText placeholder="Select receiver" />
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
              <Text fontSize="sm" fontWeight="medium" mb={1} color="fg.label">Amount ($)</Text>
              <Input
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                type="text"
                inputMode="decimal"
              />
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={1} color="fg.label">Date</Text>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={1} color="fg.label">Note (optional)</Text>
              <Input
                placeholder="e.g. Cash, PayNow"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </Box>
          </VStack>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} mr={2}>Cancel</Button>
          <Button colorPalette="teal" onClick={handleSubmit} loading={loading}>
            Record Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  )
}
