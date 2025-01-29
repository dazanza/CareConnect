import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { toast } from 'react-hot-toast'

/**
 * Utility for handling navigation in the application
 * Provides consistent error handling and fallback behavior
 */
export const appNavigation = {
  /**
   * Navigate to a specific appointment
   * @param router Next.js router instance
   * @param id Appointment ID
   * @param options Optional configuration
   */
  goToAppointment: (
    router: AppRouterInstance, 
    id: string, 
    options?: { 
      showToast?: boolean 
    }
  ) => {
    try {
      router.push(`/appointments/${id}`)
    } catch (error) {
      console.error('Navigation error:', error)
      if (options?.showToast) {
        toast.error('Failed to navigate to appointment')
      }
      // Fallback to home page if navigation fails
      router.push('/appointments')
    }
  },

  /**
   * Navigate to a specific patient
   * @param router Next.js router instance
   * @param id Patient ID
   * @param options Optional configuration
   */
  goToPatient: (
    router: AppRouterInstance, 
    id: string,
    options?: { 
      showToast?: boolean 
    }
  ) => {
    try {
      router.push(`/patients/${id}`)
    } catch (error) {
      console.error('Navigation error:', error)
      if (options?.showToast) {
        toast.error('Failed to navigate to patient')
      }
      router.push('/patients')
    }
  },

  /**
   * Navigate back or to a fallback route if back fails
   * @param router Next.js router instance
   * @param fallbackRoute Route to navigate to if back fails
   */
  goBack: (
    router: AppRouterInstance, 
    fallbackRoute: string = '/'
  ) => {
    try {
      router.back()
    } catch (error) {
      console.error('Navigation error:', error)
      router.push(fallbackRoute)
    }
  },

  /**
   * Safe navigation to any route with error handling
   * @param router Next.js router instance
   * @param route Target route
   * @param options Optional configuration
   */
  navigateTo: (
    router: AppRouterInstance, 
    route: string,
    options?: {
      showToast?: boolean
      fallbackRoute?: string
    }
  ) => {
    try {
      router.push(route)
    } catch (error) {
      console.error('Navigation error:', error)
      if (options?.showToast) {
        toast.error('Navigation failed')
      }
      if (options?.fallbackRoute) {
        router.push(options.fallbackRoute)
      }
    }
  },

  /**
   * Navigate to a specific doctor
   * @param router Next.js router instance
   * @param id Doctor ID
   * @param options Optional configuration
   */
  goToDoctor: (
    router: AppRouterInstance, 
    id: string,
    options?: { 
      showToast?: boolean 
    }
  ) => {
    try {
      router.push(`/doctors/${id}`)
    } catch (error) {
      console.error('Navigation error:', error)
      if (options?.showToast) {
        toast.error('Failed to navigate to doctor')
      }
      router.push('/doctors')
    }
  },
} 
