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
import { AlertCircle, RefreshCw, Pencil, XCircle, ChevronLeft } from 'lucide-react'
import { appNavigation } from '@/app/lib/navigation'

interface PrescriptionDetailsProps {
  params: {
    id: string
  }
}

interface Patient {
  id: number;
  name: string;
  nickname?: string;
}

interface Doctor {
  id: number;
  name: string;
}

interface PrescriptionWithDetails extends Prescription {
  patient: Patient;
  doctor: Doctor;
}

export default function PrescriptionDetailsPage({ params }: PrescriptionDetailsProps) {
  const router = useRouter()
  const { supabase } = useSupabase()
  const [prescription, setPrescription] = useState<PrescriptionWithDetails | null>(null)
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
            last_name,
            nickname
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

      // Transform the data to match our expected types
      const transformedData: PrescriptionWithDetails = {
        ...data,
        patient: {
          id: data.patient.id,
          name: `${data.patient.first_name} ${data.patient.last_name}`,
          nickname: data.patient.nickname
        },
        doctor: {
          id: data.doctor.id,
          name: `Dr. ${data.doctor.first_name} ${data.doctor.last_name}`
        }
      };

      setPrescription(transformedData);
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

  const handleBackClick = () => {
    appNavigation.goBack(router, '/prescriptions')
  }

  const handlePatientClick = (patientId: string) => {
    appNavigation.goToPatient(router, patientId, { showToast: true })
  }

  const handleDoctorClick = (doctorId: string) => {
    appNavigation.goToDoctor(router, doctorId, { showToast: true })
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!prescription) {
    return <div>Prescription not found</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={handleBackClick} className="mb-4">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Prescriptions
        </Button>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Prescription Details</h1>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Patient Information</h2>
                  <Button
                    variant="link"
                    className="p-0 h-auto font-normal hover:no-underline"
                    onClick={() => prescription?.patient?.id && handlePatientClick(prescription.patient.id.toString())}
                  >
                    {prescription?.patient?.name}
                    {prescription?.patient?.nickname && ` (${prescription.patient.nickname})`}
                  </Button>
                </div>
                <div className="text-right">
                  <h2 className="text-xl font-semibold">Prescribed By</h2>
                  <Button
                    variant="link"
                    className="p-0 h-auto font-normal hover:no-underline"
                    onClick={() => prescription?.doctor?.id && handleDoctorClick(prescription.doctor.id.toString())}
                  >
                    {prescription?.doctor?.name}
                  </Button>
                </div>
              </div>
              
              <PrescriptionCard prescription={prescription} />
              
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowUpdateDialog(true)}
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Update
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowRefillDialog(true)}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refill
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowDiscontinueDialog(true)}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Discontinue
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <PrescriptionHistory prescription={prescription} events={events} />
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