import { defineConfig } from '@chakra-ui/react'

const config = defineConfig({
  globalCss: {
    'html, body': {
      margin: 0,
      padding: 0,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
  },
  theme: {
    tokens: {
      colors: {
        teal: {
          50:  { value: '#EEF3F9' },
          100: { value: '#D4E2F0' },
          200: { value: '#AABFDE' },
          300: { value: '#7D9CC9' },
          400: { value: '#5279B4' },
          500: { value: '#3B6494' },
          600: { value: '#2C4A6E' },
          700: { value: '#1E3450' },
          800: { value: '#122030' },
          900: { value: '#091218' },
        },
      },
    },
  },
})

export default config
