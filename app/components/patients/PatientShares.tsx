'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/app/hooks/useSupabase'
import { Button } from '@/components/ui/button'
import { SharePatientDialog } from './SharePatientDialog'
import { getPatientShares, removePatientShare } from '@/lib/patient-sharing'
import { format } from 'date-fns'
import { toast } from 'react-hot-toast'
import { Users, Trash2 } from 'lucide-react'

interface PatientSharesProps {
  patientId: number
  patientName: string
}

export function PatientShares({ patientId, patientName }: PatientSharesProps) {
  const { supabase } = useSupabase()
  const [shares, setShares] = useState<PatientShare[]>([])
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchShares()
  }, [patientId])

  async function fetchShares() {
    if (!supabase) return

    try {
      setIsLoading(true)
      const data = await getPatientShares(supabase, patientId)
      setShares(data)
    } catch (error) {
      console.error('Error fetching shares:', error)
      toast.error('Failed to load shares')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleRemoveShare(shareId: string) {
    if (!supabase) return

    try {
      await removePatientShare(supabase, shareId)
      toast.success('Share removed')
      await fetchShares()
    } catch (error) {
      console.error('Error removing share:', error)
      toast.error('Failed to remove share')
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Shared With</h3>
        <Button 
          size="sm"
          onClick={() => setIsShareDialogOpen(true)}
        >
          <Users className="w-4 h-4 mr-2" />
          Share Patient
        </Button>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : shares.length > 0 ? (
        <div className="space-y-2">
          {shares.map((share) => (
            <div 
              key={share.id} 
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="font-medium">{share.shared_with.email}</p>
                <p className="text-sm text-gray-600">
                  {share.access_level} access
                  {share.expires_at && ` · Expires ${format(new Date(share.expires_at), 'MMM d, yyyy')}`}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveShare(share.id)}
                className="text-red-600 hover:text-red-800 hover:bg-red-100"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">Not shared with anyone</p>
      )}

      <SharePatientDialog
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
        patientId={patientId}
        patientName={patientName}
      />
    </div>
  )
}
