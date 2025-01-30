import { showToast } from '@/app/lib/toast'

export function DoctorForm({ onSuccess, initialData }: DoctorFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { supabase } = useSupabase()
  const queryClient = useQueryClient()

  const handleSubmit = async (formData: DoctorFormData) => {
    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('doctors')
        .insert([formData])
        .select()
        .single()

      if (error) throw error

      queryClient.invalidateQueries({ queryKey: ['doctors'] })
      showToast.success('Doctor added successfully')
      onSuccess?.()
      resetForm()
    } catch (error) {
      console.error('Error adding doctor:', error)
      showToast.error('Failed to add doctor')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async (formData: DoctorFormData) => {
    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('doctors')
        .update(formData)
        .eq('id', initialData.id)

      if (error) throw error

      queryClient.invalidateQueries({ queryKey: ['doctors'] })
      showToast.success('Doctor updated successfully')
      onSuccess?.()
    } catch (error) {
      console.error('Error updating doctor:', error)
      showToast.error('Failed to update doctor')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (confirmName !== `${initialData.first_name} ${initialData.last_name}`) {
      showToast.error('Please type the doctor name correctly to confirm deletion')
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('doctors')
        .update({
          deleted_at: new Date().toISOString(),
          status: 'deleted'
        })
        .eq('id', initialData.id)

      if (error) throw error

      showToast.success('Doctor deleted successfully')
      setShowDeleteDialog(false)
      setShowConfirmDialog(false)
      setTimeout(() => {
        window.location.href = '/doctors'
      }, 2000)
    } catch (error) {
      console.error('Error deleting doctor:', error)
      showToast.error('Failed to delete doctor')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ... rest of the component
} 