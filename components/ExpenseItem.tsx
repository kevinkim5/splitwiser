import { Box, Flex, Text, HStack, IconButton } from '@chakra-ui/react'
import { FiEdit2 } from 'react-icons/fi'
import dayjs from 'dayjs'
import { Expense } from '@/types'
import { useAuth } from '@/contexts/AuthContext'

interface ExpenseItemProps {
  expense: Expense
  onEdit: (expense: Expense) => void
}

export default function ExpenseItem({ expense, onEdit }: ExpenseItemProps) {
  const { user } = useAuth()
  const isMyExpense = expense.paid_by_id === user?.id
  const mySplit = expense.splits.find((s) => s.user_id === user?.id)

  let balanceText = ''
  let balanceColor = 'gray.500'

  if (isMyExpense) {
    const owedBack = expense.amount - (mySplit ? Number(mySplit.amount) : 0)
    if (owedBack > 0) {
      balanceText = `you lent $${owedBack.toFixed(2)}`
      balanceColor = 'green.600'
    } else {
      balanceText = 'not involved'
    }
  } else if (mySplit) {
    balanceText = `you borrowed $${Number(mySplit.amount).toFixed(2)}`
    balanceColor = 'orange.500'
  } else {
    balanceText = 'not involved'
  }

  return (
    <Box
      p={4}
      borderWidth="1px"
      borderRadius="lg"
      bg="bg.panel"
      borderColor="border.card"
      _hover={{ boxShadow: 'sm' }}
    >
      <Flex justify="space-between" align="flex-start">
        <HStack gap={3} flex={1}>
          <Box
            w="40px"
            h="40px"
            borderRadius="lg"
            bg="teal.chip"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
          >
            <Text fontSize="lg">{expense.category?.emoji ?? '🧾'}</Text>
          </Box>
          <Box flex={1}>
            <Text fontWeight="semibold" fontSize="sm" color="fg.heading">
              {expense.description}
            </Text>
            <Text fontSize="xs" color="fg.muted">
              {expense.category?.name && `${expense.category.name} · `}
              {expense.paid_by?.name ?? 'Unknown'} paid · {dayjs(expense.date).format('MMM D, YYYY')}
            </Text>
          </Box>
        </HStack>

        <HStack gap={2} align="flex-start">
          <Box textAlign="right">
            <Text fontWeight="bold" fontSize="sm" color="fg.heading">
              ${Number(expense.amount).toFixed(2)}
            </Text>
            <Text fontSize="xs" color={balanceColor}>
              {balanceText}
            </Text>
          </Box>
          <IconButton
            aria-label="Edit expense"
            variant="ghost"
            size="xs"
            color="fg.muted"
            _hover={{ color: 'teal.500', bg: 'teal.chip' }}
            onClick={() => onEdit(expense)}
          >
            <FiEdit2 />
          </IconButton>
        </HStack>
      </Flex>
    </Box>
  )
}
