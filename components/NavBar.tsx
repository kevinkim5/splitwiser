import { Box, Button, Flex, IconButton, Text, VStack } from '@chakra-ui/react'
import { GiHamburgerMenu } from 'react-icons/gi'

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
import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
export default function Navbar() {
  const { logout } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <Box
      bg="teal.500"
      px={4}
      py={2}
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex="sticky"
    >
      <Flex alignItems="center" justifyContent="space-between">
        {/* Hamburger Menu */}
        <IconButton
          aria-label="Open menu"
          variant="ghost"
          color="white"
          _hover={{ bg: 'teal.600' }}
          onClick={() => setOpen(true)}
        >
          <GiHamburgerMenu />
        </IconButton>

        {/* Center Icon or Brand */}
        <Text
          fontSize="lg"
          fontWeight="bold"
          color="white"
          mx="auto"
          textAlign="center"
        >
          S
        </Text>

        {/* User Avatar */}
        <MenuRoot>
          <MenuTrigger asChild>
            <Button variant="ghost">
              <Avatar
                size="sm"
                name="User Name"
                src="https://bit.ly/broken-link"
              />
            </Button>
          </MenuTrigger>
          <MenuContent>
            <MenuItem value="profile">Profile</MenuItem>
            <MenuItem value="settings">Settings</MenuItem>
            <MenuItem value="logout" onClick={logout}>
              Logout
            </MenuItem>
          </MenuContent>
        </MenuRoot>
      </Flex>

      {/* Hamburger Menu Drawer */}
      <DrawerRoot
        open={open}
        placement="start"
        onOpenChange={(e) => setOpen(e.open)}
      >
        <DrawerBackdrop />
        <DrawerContent>
          <DrawerCloseTrigger />
          <DrawerHeader>
            <Text fontWeight="bold">SplitWiser</Text>
          </DrawerHeader>
          <DrawerBody>
            <VStack gap={4} align="start">
              <Link href="/">Home</Link>
              <Link href="/groups">Groups</Link>
              <Link href="/expenses">Expenses</Link>
              <Link href="/settings">Settings</Link>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </DrawerRoot>
    </Box>
  )
}
