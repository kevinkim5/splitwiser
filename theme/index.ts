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
    semanticTokens: {
      colors: {
        'fg.heading': { value: { base: '{colors.gray.800}', _dark: '{colors.gray.50}' } },
        'fg.label':   { value: { base: '{colors.gray.700}', _dark: '{colors.gray.200}' } },
        'fg.muted':   { value: { base: '{colors.gray.500}', _dark: '{colors.gray.400}' } },
        'bg.panel':   { value: { base: 'white',             _dark: '#1F2937' } },
        'bg.page':    { value: { base: '#F9FAFB',           _dark: '#111827' } },
        'border.card':{ value: { base: '#F3F4F6',           _dark: '#374151' } },
        'teal.chip':  { value: { base: '{colors.teal.50}',  _dark: '#0d1f35' } },
        'teal.ring':  { value: { base: '{colors.teal.100}', _dark: '#162a42' } },
      },
    },
  },
})

export default config
