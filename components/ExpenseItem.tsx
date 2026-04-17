import { Box, Flex, Text, HStack, IconButton } from '@chakra-ui/react'
import { FiTrash2 } from 'react-icons/fi'
import dayjs from 'dayjs'
import { Expense } from '@/types'
import { useAuth } from '@/contexts/AuthContext'

interface ExpenseItemProps {
  expense: Expense
  onDelete: (id: string) => void
}

export default function ExpenseItem({ expense, onDelete }: ExpenseItemProps) {
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
      bg="white"
      borderColor="gray.100"
      _hover={{ boxShadow: 'sm' }}
    >
      <Flex justify="space-between" align="flex-start">
        <HStack gap={3} flex={1}>
          <Box
            w="40px"
            h="40px"
            borderRadius="lg"
            bg="teal.50"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
          >
            <Text fontSize="lg">{expense.category?.emoji ?? '🧾'}</Text>
          </Box>
          <Box flex={1}>
            <Text fontWeight="semibold" fontSize="sm" color="gray.800">
              {expense.description}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {expense.category?.name && `${expense.category.name} · `}
              {expense.paid_by?.name ?? 'Unknown'} paid · {dayjs(expense.date).format('MMM D, YYYY')}
            </Text>
          </Box>
        </HStack>

        <HStack gap={2} align="flex-start">
          <Box textAlign="right">
            <Text fontWeight="bold" fontSize="sm" color="gray.800">
              ${Number(expense.amount).toFixed(2)}
            </Text>
            <Text fontSize="xs" color={balanceColor}>
              {balanceText}
            </Text>
          </Box>
          <IconButton
            aria-label="Delete expense"
            variant="ghost"
            size="xs"
            color="gray.400"
            _hover={{ color: 'red.500', bg: 'red.50' }}
            onClick={() => onDelete(expense.id)}
          >
            <FiTrash2 />
          </IconButton>
        </HStack>
      </Flex>
    </Box>
  )
}
