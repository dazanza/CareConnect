/**
 * useDebounce Hook
 * 
 * A custom hook that provides debounced value updates.
 * Useful for delaying state updates in search inputs, form fields, etc.
 * to prevent excessive re-renders or API calls.
 * 
 * @template T The type of the value being debounced
 * @param {T} value The value to debounce
 * @param {number} delay The delay in milliseconds
 * @returns {T} The debounced value
 * 
 * @example
 * ```tsx
 * const [searchTerm, setSearchTerm] = useState('')
 * const debouncedSearch = useDebounce(searchTerm, 500)
 * 
 * useEffect(() => {
 *   // This will only run 500ms after the last searchTerm change
 *   performSearch(debouncedSearch)
 * }, [debouncedSearch])
 * ```
 */

import { useEffect, useState } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
} 