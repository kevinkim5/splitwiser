import {
  Box,
  Text,
  VStack,
  HStack,
  Badge,
  Flex,
} from '@chakra-ui/react'
import { Button } from '@/components/ui/button'
import { FiArrowRight, FiCheck } from 'react-icons/fi'
import { Balance, SimplifiedDebt } from '@/types'
import { useAuth } from '@/contexts/AuthContext'

interface BalanceSummaryProps {
  balances: Balance[]
  simplified: SimplifiedDebt[]
  onSettleUp: (debt?: SimplifiedDebt) => void
}

export default function BalanceSummary({ balances, simplified, onSettleUp }: BalanceSummaryProps) {
  const { user } = useAuth()

  const myBalance = balances.find((b) => b.userId === user?.id)

  return (
    <VStack gap={6} align="stretch">
      {/* My balance summary */}
      {myBalance && (
        <Box p={4} borderRadius="xl" bg={myBalance.amount >= 0 ? 'green.50' : 'orange.50'} borderWidth="1px" borderColor={myBalance.amount >= 0 ? 'green.100' : 'orange.100'}>
          <Text fontSize="sm" color="gray.600" mb={1}>Your balance in this group</Text>
          <Text
            fontSize="2xl"
            fontWeight="bold"
            color={myBalance.amount > 0.01 ? 'green.600' : myBalance.amount < -0.01 ? 'orange.600' : 'gray.600'}
          >
            {myBalance.amount > 0.01
              ? `+$${myBalance.amount.toFixed(2)}`
              : myBalance.amount < -0.01
              ? `-$${Math.abs(myBalance.amount).toFixed(2)}`
              : '$0.00'}
          </Text>
          <Text fontSize="xs" color="gray.500" mt={1}>
            {myBalance.amount > 0.01
              ? 'Others owe you'
              : myBalance.amount < -0.01
              ? 'You owe others'
              : 'All settled up!'}
          </Text>
        </Box>
      )}

      {/* All balances */}
      <Box>
        <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={3} textTransform="uppercase" letterSpacing="wide">
          Member Balances
        </Text>
        <VStack gap={2} align="stretch">
          {balances.map((b) => (
            <Flex key={b.userId} justify="space-between" align="center" px={3} py={2} borderRadius="md" bg="white" borderWidth="1px" borderColor="gray.100">
              <HStack gap={2}>
                <Box
                  w="32px"
                  h="32px"
                  borderRadius="full"
                  bg="teal.100"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontSize="sm" fontWeight="bold" color="teal.700">
                    {b.name.charAt(0).toUpperCase()}
                  </Text>
                </Box>
                <Text fontSize="sm" fontWeight={b.userId === user?.id ? 'semibold' : 'normal'}>
                  {b.userId === user?.id ? 'You' : b.name}
                </Text>
              </HStack>
              <Text
                fontSize="sm"
                fontWeight="semibold"
                color={b.amount > 0.01 ? 'green.600' : b.amount < -0.01 ? 'orange.600' : 'gray.400'}
              >
                {b.amount > 0.01
                  ? `+$${b.amount.toFixed(2)}`
                  : b.amount < -0.01
                  ? `-$${Math.abs(b.amount).toFixed(2)}`
                  : 'settled'}
              </Text>
            </Flex>
          ))}
        </VStack>
      </Box>

      {/* Simplified debts */}
      {simplified.length > 0 && (
        <Box>
          <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={3} textTransform="uppercase" letterSpacing="wide">
            Suggested Payments
          </Text>
          <VStack gap={2} align="stretch">
            {simplified.map((debt, i) => (
              <Flex
                key={i}
                p={3}
                borderRadius="lg"
                bg="white"
                borderWidth="1px"
                borderColor="gray.100"
                justify="space-between"
                align="center"
                gap={2}
              >
                <HStack gap={2} flex={1}>
                  <Text fontSize="sm" fontWeight="medium" color="orange.600">
                    {debt.from === user?.id ? 'You' : debt.fromName}
                  </Text>
                  <FiArrowRight size={14} color="#9CA3AF" />
                  <Text fontSize="sm" fontWeight="medium" color="green.600">
                    {debt.to === user?.id ? 'You' : debt.toName}
                  </Text>
                  <Badge colorPalette="teal" variant="subtle" ml={1}>
                    ${debt.amount.toFixed(2)}
                  </Badge>
                </HStack>
                <Button
                  size="xs"
                  colorPalette="teal"
                  variant="outline"
                  onClick={() => onSettleUp(debt)}
                >
                  Settle
                </Button>
              </Flex>
            ))}
          </VStack>
        </Box>
      )}

      {simplified.length === 0 && balances.every((b) => Math.abs(b.amount) < 0.01) && (
        <Flex align="center" gap={2} p={4} bg="green.50" borderRadius="lg" borderWidth="1px" borderColor="green.100">
          <FiCheck color="green" />
          <Text fontSize="sm" color="green.700" fontWeight="medium">All settled up! No outstanding balances.</Text>
        </Flex>
      )}

      <Button colorPalette="teal" variant="solid" size="sm" onClick={() => onSettleUp()}>
        + Record a Payment
      </Button>
    </VStack>
  )
}
