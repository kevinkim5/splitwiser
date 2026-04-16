import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { NextComponentType, NextPageContext } from 'next'
import { AppProps } from 'next/app'
import { ChakraProvider, createSystem, Box } from '@chakra-ui/react'

import { Provider } from '@/components/ui/provider'
import Navbar from '@/components/NavBar'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import config from '@/theme'

const system = createSystem(config)

const PUBLIC_ROUTES = ['/login']

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider value={system}>
      <AuthProvider>
        <Provider>
          <AppShell Component={Component} pageProps={pageProps} />
        </Provider>
      </AuthProvider>
    </ChakraProvider>
  )
}

type ShellProps = {
  Component: NextComponentType<NextPageContext, unknown, unknown>
  pageProps: Record<string, unknown>
}

function AppShell({ Component, pageProps }: ShellProps) {
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()
  const isPublic = PUBLIC_ROUTES.includes(router.pathname)

  useEffect(() => {
    if (!loading && !isAuthenticated && !isPublic) {
      router.push('/login')
    }
    if (!loading && isAuthenticated && isPublic) {
      router.push('/groups')
    }
  }, [isAuthenticated, loading, isPublic, router])

  const showNavbar = isAuthenticated && !isPublic
  const showContent =
    !loading && (isPublic || isAuthenticated)

  return (
    <>
      {showNavbar && <Navbar />}
      <Box pt={showNavbar ? 16 : 0} minH="100vh" bg="gray.50">
        {showContent && <Component {...pageProps} />}
      </Box>
    </>
  )
}

export default MyApp
