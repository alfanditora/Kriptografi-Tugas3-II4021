import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const customTheme = {
  dark: false,
  colors: {
    // Primary & Action Colors
    primary: '#1DA88B',      // Deep Teal - Main buttons, icons, active states
    secondary: '#DFF1EE',    // Mint Green - Secondary buttons, badges
    accent: '#DFE2F1',       // Soft Lavender - Chat bubbles, subtle backgrounds

    // Neutrals & Backgrounds
    background: '#F7F9FC',   // Off-White / Cool Gray - App background
    surface: '#FFFFFF',      // Primary White - Cards, containers

    // Typography & Text
    'on-primary': '#FFFFFF',
    'on-secondary': '#2D3748',    // Dark Charcoal
    'on-background': '#2D3748',   // Dark Charcoal
    'on-surface': '#2D3748',      // Dark Charcoal

    // Utility colors
    error: '#E53E3E',
    info: '#3182CE',
    success: '#38A169',
    warning: '#D69E2E',

    // Additional text colors for variations
    'text-primary': '#2D3748',    // Dark Charcoal
    'text-secondary': '#718096',  // Medium Gray
    'border-color': '#CBD5E0',    // Light Slate
  }
}

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'customTheme',
    themes: {
      customTheme,
    }
  },
})

export default vuetify