'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/app/hooks/useSupabase'
import { Button } from '@/components/ui/button'
import { SharePatientDialog } from './SharePatientDialog'
import { getPatientShares, removePatientShare } from '@/app/lib/patient-sharing'
import { format } from 'date-fns'
import { toast } from 'react-hot-toast'
import { Users, Trash2, AlertCircle } from 'lucide-react'

interface PatientSharesProps {
  patientId: string
  patientName: string
  variant?: string
}

interface PatientShare {
  id: string
  patient_id: string
  shared_by_user_id: string
  shared_with_user_id: string
  access_level: string
  expires_at: string | null
  created_at: string
  shared_with: {
    email: string
    first_name?: string
    last_name?: string
  }
}

export function PatientShares({ patientId, patientName, variant }: PatientSharesProps) {
  const { supabase } = useSupabase()
  const [shares, setShares] = useState<PatientShare[]>([])
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    fetchShares()
  }, [patientId])

  async function fetchShares() {
    if (!supabase) return

    try {
      setIsLoading(true)
      setError(null)
      const data = await getPatientShares(supabase, parseInt(patientId))
      
      // Filter out expired shares
      const now = new Date()
      const validShares = data.filter(share => {
        if (!share.expires_at) return true
        return new Date(share.expires_at) > now
      })
      
      setShares(validShares)
    } catch (error) {
      console.error('Error fetching shares:', error)
      setError(error instanceof Error ? error : new Error('Failed to load shares'))
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

  if (error) {
    return (
      <div className="p-4 rounded-md bg-destructive/10 text-destructive">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <p>Failed to load shares: {error.message}</p>
        </div>
      </div>
    )
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
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : shares.length > 0 ? (
        <div className="space-y-2">
          {shares.map((share) => {
            const isExpiringSoon = share.expires_at && 
              new Date(share.expires_at).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000 // 7 days

            return (
              <div 
                key={share.id} 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium">{share.shared_with.email}</p>
                  <p className="text-sm text-gray-600">
                    {share.access_level} access
                    {share.expires_at && (
                      <span className={isExpiringSoon ? 'text-yellow-600' : ''}>
                        {` · Expires ${format(new Date(share.expires_at), 'MMM d, yyyy')}`}
                        {isExpiringSoon && ' (Expiring soon)'}
                      </span>
                    )}
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
            )
          })}
        </div>
      ) : (
        <p className="text-gray-600">Not shared with anyone</p>
      )}

      <SharePatientDialog
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
        patientId={patientId}
        onSuccess={fetchShares}
      />
    </div>
  )
}
