import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Box, Flex, IconButton, Text, VStack, HStack } from '@chakra-ui/react'
import { Button } from '@/components/ui/button'
import { GiHamburgerMenu } from 'react-icons/gi'
import { FiUsers, FiLogOut } from 'react-icons/fi'

import { Avatar } from './ui/avatar'
import { MenuRoot, MenuItem, MenuContent, MenuTrigger } from './ui/menu'
import {
  DrawerRoot,
  DrawerBackdrop,
  DrawerContent,
  DrawerCloseTrigger,
  DrawerHeader,
  DrawerBody,
} from './ui/drawer'
import { useAuth } from '@/contexts/AuthContext'

export default function Navbar() {
  const { logout, user } = useAuth()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  return (
    <Box
      bg="teal.600"
      px={4}
      py={3}
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex="sticky"
      boxShadow="sm"
    >
      <Flex alignItems="center" justifyContent="space-between">
        <IconButton
          aria-label="Open menu"
          variant="ghost"
          color="white"
          _hover={{ bg: 'teal.700' }}
          onClick={() => setOpen(true)}
          size="sm"
        >
          <GiHamburgerMenu />
        </IconButton>

        <Link href="/groups" style={{ textDecoration: 'none' }}>
          <Text
            fontSize="xl"
            fontWeight="bold"
            color="white"
            letterSpacing="tight"
            _hover={{ opacity: 0.9 }}
          >
            SplitWiser
          </Text>
        </Link>

        <MenuRoot>
          <MenuTrigger asChild>
            <Button variant="ghost" p={0} rounded="full" _hover={{ bg: 'teal.700' }}>
              <Avatar size="sm" name={user?.name} bg="teal.300" />
            </Button>
          </MenuTrigger>
          <MenuContent>
            <MenuItem value="name" disabled>
              <Text fontWeight="semibold" fontSize="sm">{user?.name}</Text>
            </MenuItem>
            <MenuItem value="logout" onClick={logout} color="red.500">
              Logout
            </MenuItem>
          </MenuContent>
        </MenuRoot>
      </Flex>

      <DrawerRoot open={open} placement="start" onOpenChange={(e) => setOpen(e.open)}>
        <DrawerBackdrop />
        <DrawerContent>
          <DrawerCloseTrigger />
          <DrawerHeader borderBottomWidth="1px">
            <Text fontWeight="bold" fontSize="lg" color="teal.600">SplitWiser</Text>
          </DrawerHeader>
          <DrawerBody pt={4}>
            <VStack gap={1} align="stretch">
              <NavLink href="/groups" icon={<FiUsers />} label="Groups" active={router.pathname.startsWith('/groups')} onClick={() => setOpen(false)} />
              <Box pt={4} borderTopWidth="1px" mt={2}>
                <HStack
                  gap={3}
                  px={3}
                  py={2}
                  borderRadius="md"
                  cursor="pointer"
                  color="red.500"
                  _hover={{ bg: 'red.50' }}
                  onClick={() => { setOpen(false); logout() }}
                >
                  <FiLogOut />
                  <Text fontSize="sm" fontWeight="medium">Logout</Text>
                </HStack>
              </Box>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </DrawerRoot>
    </Box>
  )
}

function NavLink({
  href,
  icon,
  label,
  active,
  onClick,
}: {
  href: string
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }} onClick={onClick}>
      <HStack
        gap={3}
        px={3}
        py={2}
        borderRadius="md"
        bg={active ? 'teal.50' : 'transparent'}
        color={active ? 'teal.600' : 'gray.700'}
        fontWeight={active ? 'semibold' : 'normal'}
        _hover={{ bg: 'teal.50', color: 'teal.600' }}
      >
        {icon}
        <Text fontSize="sm">{label}</Text>
      </HStack>
    </Link>
  )
}
