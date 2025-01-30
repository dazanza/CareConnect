import { showToast } from '@/app/lib/toast'

// Inside createPrescription function
try {
  // ... existing code ...
  showToast.success('Prescription created successfully')
  setIsDialogOpen(false)
  router.refresh()
} catch (error) {
  console.error('Error creating prescription:', error)
  showToast.error('Failed to create prescription')
} finally {
  setIsSubmitting(false)
}

// Inside searchPrescriptions function
} catch (error) {
  console.error('Error searching prescriptions:', error)
  showToast.error('Failed to search prescriptions')
}
// ... existing code ... 