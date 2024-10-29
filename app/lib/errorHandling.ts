import { toast } from 'react-hot-toast'

export function handleError(error: unknown, context: string) {
  const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
  console.error(`Error in ${context}:`, error)
  toast.error(errorMessage)
  return errorMessage
} 