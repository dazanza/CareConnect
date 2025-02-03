import { toast as toastOriginal } from "sonner"

export const toast = {
  title: (title: string, options?: { variant?: 'default' | 'destructive' }) => {
    toastOriginal[options?.variant === 'destructive' ? 'error' : 'success'](title)
  },
} 