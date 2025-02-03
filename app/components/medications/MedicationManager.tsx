'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Medication, MedicationFormData, MedicationManagerProps } from '@/types/medications'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/components/ui/use-toast'
import { MedicationForm } from './MedicationForm'

export function MedicationManager({ patientId, doctors, initialMedications = [], canEdit = true }: MedicationManagerProps) {
  const [medications, setMedications] = useState<Medication[]>(initialMedications)
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState<number | null>(null)
  const [medicationToDelete, setMedicationToDelete] = useState<Medication | null>(null)
  const [showForm, setShowForm] = useState(false)
  
  const router = useRouter()
  const supabase = createClientComponentClient()

  async function handleAddMedication(data: MedicationFormData) {
    try {
      setIsLoading(true)
      const { data: medication, error } = await supabase
        .from('medications')
        .insert([{
          ...data,
          patient_id: patientId,
          status: 'active',
        }])
        .select('*, doctor:doctors(*)')
        .single()

      if (error) throw error

      setMedications([...medications, medication])
      setShowForm(false)
      toast({ title: 'Medication added successfully' })
      router.refresh()
    } catch (error) {
      console.error('Error adding medication:', error)
      toast({ 
        title: 'Error adding medication',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleUpdateMedication(id: number, data: MedicationFormData) {
    try {
      setIsLoading(true)
      const { data: medication, error } = await supabase
        .from('medications')
        .update(data)
        .eq('id', id)
        .select('*, doctor:doctors(*)')
        .single()

      if (error) throw error

      setMedications(medications.map(med => med.id === id ? medication : med))
      setIsEditing(null)
      toast({ title: 'Medication updated successfully' })
      router.refresh()
    } catch (error) {
      console.error('Error updating medication:', error)
      toast({ 
        title: 'Error updating medication',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDeleteMedication(medication: Medication) {
    try {
      setIsLoading(true)
      const { error } = await supabase
        .from('medications')
        .delete()
        .eq('id', medication.id)

      if (error) throw error

      setMedications(medications.filter(med => med.id !== medication.id))
      setMedicationToDelete(null)
      toast({ title: 'Medication deleted successfully' })
      router.refresh()
    } catch (error) {
      console.error('Error deleting medication:', error)
      toast({ 
        title: 'Error deleting medication',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {canEdit && !showForm && (
        <Button onClick={() => setShowForm(true)}>Add Medication</Button>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Medication</CardTitle>
          </CardHeader>
          <CardContent>
            <MedicationForm
              doctors={doctors}
              onSubmit={handleAddMedication}
              onCancel={() => setShowForm(false)}
            />
          </CardContent>
        </Card>
      )}

      {medications.map(medication => (
        <Card key={medication.id}>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>{medication.name} - {medication.dosage}</span>
              {canEdit && (
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(medication.id)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setMedicationToDelete(medication)}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing === medication.id ? (
              <MedicationForm
                doctors={doctors}
                initialData={medication}
                onSubmit={(data) => handleUpdateMedication(medication.id, data)}
                onCancel={() => setIsEditing(null)}
              />
            ) : (
              <div className="space-y-2">
                <p><strong>Frequency:</strong> {medication.frequency}</p>
                <p><strong>Start Date:</strong> {new Date(medication.start_date).toLocaleDateString()}</p>
                {medication.end_date && (
                  <p><strong>End Date:</strong> {new Date(medication.end_date).toLocaleDateString()}</p>
                )}
                {medication.instructions && (
                  <p><strong>Instructions:</strong> {medication.instructions}</p>
                )}
                {medication.doctor && (
                  <p><strong>Doctor:</strong> Dr. {medication.doctor.first_name} {medication.doctor.last_name}</p>
                )}
                {medication.side_effects && (
                  <p><strong>Side Effects:</strong> {medication.side_effects}</p>
                )}
                <p><strong>Status:</strong> {medication.status}</p>
                {medication.adherence_rate && (
                  <p><strong>Adherence Rate:</strong> {medication.adherence_rate}%</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <AlertDialog open={!!medicationToDelete} onOpenChange={() => setMedicationToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this medication?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the medication
              {medicationToDelete?.name && ` "${medicationToDelete.name}"`} and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => medicationToDelete && handleDeleteMedication(medicationToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}