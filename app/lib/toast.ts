import { toast } from 'react-hot-toast'

// Standard durations
const DURATION = {
  SHORT: 3000,
  MEDIUM: 5000,
  LONG: 10000
}

// Standard icons
const ICONS = {
  SUCCESS: '✅',
  ERROR: '❌',
  WARNING: '⚠️',
  INFO: 'ℹ️'
}

export const showToast = {
  success: (message: string) => {
    toast(message, {
      icon: ICONS.SUCCESS,
      duration: DURATION.MEDIUM
    })
  },
  
  error: (message: string) => {
    toast(message, {
      icon: ICONS.ERROR, 
      duration: DURATION.MEDIUM
    })
  },
  
  warning: (message: string) => {
    toast(message, {
      icon: ICONS.WARNING,
      duration: DURATION.LONG 
    })
  },
  
  info: (message: string) => {
    toast(message, {
      icon: ICONS.INFO,
      duration: DURATION.MEDIUM
    })
  }
} 