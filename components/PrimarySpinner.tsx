import { Box, Spinner, Text } from '@chakra-ui/react'

type PrimarySpinnerProps = {
  message?: string
}

export default function PrimarySpinner(props: PrimarySpinnerProps) {
  const { message } = props
  return (
    <Box textAlign="center" mt={10}>
      <Spinner size="lg" />
      {message && <Text mt={4}>{message}</Text>}
    </Box>
  )
}
