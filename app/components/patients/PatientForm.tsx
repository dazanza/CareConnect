import { showToast } from '@/app/lib/toast'

// Inside handleSubmit
try {
  // ... existing code ...
  showToast.success('Patient added successfully')
  onSuccess?.()
  resetForm()
} catch (error) {
  console.error('Error adding patient:', error)
  showToast.error('Failed to add patient')
} finally {
  setIsSubmitting(false)
}

// Inside handleUpdate
try {
  // ... existing code ...
  showToast.success('Patient updated successfully')
} catch (error) {
  console.error('Error updating patient:', error)
  showToast.error('Failed to update patient')
}

// Inside handleDelete
try {
  // ... existing code ...
  showToast.success('Patient deleted successfully')
} catch (error) {
  console.error('Error deleting patient:', error)
  showToast.error('Failed to delete patient')
} 