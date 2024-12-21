import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { NextComponentType, NextPageContext } from 'next'

import { Provider } from '@/components/ui/provider'
import { Box, ChakraProvider, createSystem } from '@chakra-ui/react'
import Navbar from '@/components/NavBar'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import config from '@/theme'
import { AppProps } from 'next/app'

const system = createSystem(config)

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider value={system}>
      <AuthProvider>
        <Provider>
          <AuthComponent Component={Component} pageProps={pageProps} />
        </Provider>
      </AuthProvider>
    </ChakraProvider>
  )
}

type AuthComponentProps = {
  Component: NextComponentType<NextPageContext, unknown, unknown>
  pageProps: Record<string, unknown>
}

const AuthComponent = ({ Component, pageProps }: AuthComponentProps) => {
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()

  useEffect(() => {
    if (!loading && !isAuthenticated && router.pathname !== '/login') {
      router.push('/login') // Redirect to LoginForm only if not on the login page
    }
  }, [isAuthenticated, loading, router])

  return (
    <>
      {isAuthenticated && <Navbar />}

      <Box pt={16}>
        {(router.pathname === '/login' || (!loading && isAuthenticated)) && (
          <Component {...pageProps} />
        )}
      </Box>
    </>
  )
}

export default MyApp
