import { Box } from '@chakra-ui/react'
import GroupList from '@/components/GroupList'

export default function GroupsPage() {
  return (
    <Box maxW="lg" mx="auto" py={8} px={4}>
      <GroupList />
    </Box>
  )
}
