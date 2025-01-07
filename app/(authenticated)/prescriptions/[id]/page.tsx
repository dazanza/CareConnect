'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/app/hooks/useSupabase'
import { PrescriptionCard, Prescription } from '@/app/components/prescriptions/PrescriptionCard'
import { PrescriptionHistory } from '@/app/components/prescriptions/PrescriptionHistory'
import { fetchPrescriptions, fetchPrescriptionHistory, updatePrescription, refillPrescription } from '@/app/lib/prescriptions'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'react-hot-toast'
import { AlertCircle, RefreshCw, Pencil, XCircle } from 'lucide-react'

interface PrescriptionDetailsProps {
  params: {
    id: string
  }
}

export default function PrescriptionDetailsPage({ params }: PrescriptionDetailsProps) {
  const router = useRouter()
  const { supabase } = useSupabase()
  const [prescription, setPrescription] = useState<Prescription | null>(null)
  const [events, setEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showRefillDialog, setShowRefillDialog] = useState(false)
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)
  const [showDiscontinueDialog, setShowDiscontinueDialog] = useState(false)
  const [refillCount, setRefillCount] = useState('')
  const [updateReason, setUpdateReason] = useState('')
  const [discontinueReason, setDiscontinueReason] = useState('')
  const [updatedDosage, setUpdatedDosage] = useState('')
  const [updatedFrequency, setUpdatedFrequency] = useState('')

  const loadPrescriptionData = useCallback(async () => {
    if (!supabase || !params.id) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .select(`
          *,
          patient:patients (
            id,
            first_name,
            last_name
          ),
          doctor:doctors (
            id,
            first_name,
            last_name
          )
        `)
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setPrescription(data);
    } catch (error) {
      console.error('Error loading prescription:', error);
      toast.error('Failed to load prescription');
    } finally {
      setIsLoading(false);
    }
  }, [supabase, params.id]);

  useEffect(() => {
    loadPrescriptionData();
  }, [loadPrescriptionData]);

  async function handleRefill() {
    if (!prescription || !supabase) return

    try {
      const count = parseInt(refillCount)
      if (isNaN(count) || count < 0) {
        toast.error('Please enter a valid refill count')
        return
      }

      await refillPrescription(supabase, prescription.id, count)
      await loadPrescriptionData()
      setShowRefillDialog(false)
      setRefillCount('')
      toast.success('Prescription refilled successfully')
    } catch (error) {
      console.error('Error refilling prescription:', error)
      toast.error('Failed to refill prescription')
    }
  }

  async function handleUpdate() {
    if (!prescription || !supabase) return

    try {
      const updates: Partial<Prescription> = {
        dosage: updatedDosage || prescription.dosage,
        frequency: updatedFrequency || prescription.frequency
      }

      await updatePrescription(supabase, prescription.id, updates, updateReason)
      await loadPrescriptionData()
      setShowUpdateDialog(false)
      setUpdatedDosage('')
      setUpdatedFrequency('')
      setUpdateReason('')
      toast.success('Prescription updated successfully')
    } catch (error) {
      console.error('Error updating prescription:', error)
      toast.error('Failed to update prescription')
    }
  }

  async function handleDiscontinue() {
    if (!prescription || !supabase) return

    try {
      await updatePrescription(
        supabase, 
        prescription.id, 
        { status: 'discontinued' }, 
        discontinueReason
      )
      await loadPrescriptionData()
      setShowDiscontinueDialog(false)
      setDiscontinueReason('')
      toast.success('Prescription discontinued successfully')
    } catch (error) {
      console.error('Error discontinuing prescription:', error)
      toast.error('Failed to discontinue prescription')
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!prescription) {
    return null
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Prescription Details</h1>
        <div className="flex items-center gap-2">
          {prescription.status === 'active' && (
            <>
              <Button 
                variant="outline" 
                onClick={() => setShowRefillDialog(true)}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refill
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowUpdateDialog(true)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Update
              </Button>
              <Button 
                variant="destructive"
                onClick={() => setShowDiscontinueDialog(true)}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Discontinue
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <PrescriptionCard
            prescription={prescription}
            showPatient
          />

          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label>Notes</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {prescription.notes || 'No notes available'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <PrescriptionHistory
          prescription={prescription}
          events={events}
        />
      </div>

      <Dialog open={showRefillDialog} onOpenChange={setShowRefillDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refill Prescription</DialogTitle>
            <DialogDescription>
              Enter the number of refills to add to this prescription.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="refillCount">Number of Refills</Label>
              <Input
                id="refillCount"
                type="number"
                min="0"
                value={refillCount}
                onChange={(e) => setRefillCount(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRefillDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRefill}>
              Refill Prescription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Prescription</DialogTitle>
            <DialogDescription>
              Update the dosage or frequency of this prescription.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="dosage">Dosage</Label>
              <Input
                id="dosage"
                placeholder={prescription.dosage}
                value={updatedDosage}
                onChange={(e) => setUpdatedDosage(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Input
                id="frequency"
                placeholder={prescription.frequency}
                value={updatedFrequency}
                onChange={(e) => setUpdatedFrequency(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Update</Label>
              <Textarea
                id="reason"
                placeholder="Enter the reason for this update"
                value={updateReason}
                onChange={(e) => setUpdateReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpdateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>
              Update Prescription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDiscontinueDialog} onOpenChange={setShowDiscontinueDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discontinue Prescription</DialogTitle>
            <DialogDescription>
              Are you sure you want to discontinue this prescription? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="discontinueReason">Reason for Discontinuation</Label>
              <Textarea
                id="discontinueReason"
                placeholder="Enter the reason for discontinuing this prescription"
                value={discontinueReason}
                onChange={(e) => setDiscontinueReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDiscontinueDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDiscontinue}>
              Discontinue Prescription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 