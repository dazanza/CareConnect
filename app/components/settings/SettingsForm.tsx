import { showToast } from '@/app/lib/toast'

// Inside handleSave
try {
  await saveSettings(formData)
  showToast.success('Settings saved successfully')
} catch (error) {
  console.error('Error saving settings:', error)
  showToast.error('Failed to save settings')
} finally {
  setIsSubmitting(false)
}

// Inside handleDeleteAccount
if (confirmEmail !== user.email) {
  showToast.error('Please enter your email correctly to confirm deletion')
  return
}

try {
  await deleteAccount()
  showToast.success('Account deleted successfully')
  router.push('/sign-in')
} catch (error) {
  console.error('Error deleting account:', error)
  showToast.error('Failed to delete account')
} finally {
  setIsSubmitting(false)
  setShowDeleteDialog(false)
} 