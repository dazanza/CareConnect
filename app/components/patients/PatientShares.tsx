'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/app/hooks/useSupabase'
import { useAuth } from '@/app/components/auth/SupabaseAuthProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'react-hot-toast'
import { sharePatient } from '@/app/lib/patient-sharing'
import { Users, Trash2, AlertCircle } from 'lucide-react'
import { SharePatientDialog } from './SharePatientDialog'
import { getPatientShares, removePatientShare } from '@/app/lib/patient-sharing'
import { format } from 'date-fns'

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
  const { user } = useAuth()
  const { supabase } = useSupabase()
  const [shares, setShares] = useState<PatientShare[]>([])
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [email, setEmail] = useState('')
  const [accessLevel, setAccessLevel] = useState('read')

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id || !patientId || !supabase) {
      const error = new Error('Missing required data')
      console.error(error)
      throw error
    }

    setIsLoading(true)
    try {
      // First, find the user by email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single()

      if (userError) {
        const error = new Error(
          userError.code === 'PGRST116' 
            ? 'User not found with this email' 
            : 'Failed to find user'
        )
        console.error('Error finding user:', userError)
        throw error
      }

      if (!userData?.id) {
        const error = new Error('User not found with this email')
        console.error(error)
        throw error
      }

      // Share the patient
      await sharePatient(supabase, {
        patientId: parseInt(patientId),
        sharedByUserId: user.id,
        sharedWithUserId: userData.id,
        accessLevel: accessLevel as any
      })

      toast.success('Patient shared successfully')
      setEmail('')
      setAccessLevel('read')
    } catch (error) {
      console.error('Error sharing patient:', error)
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred while sharing the patient'
      toast.error(errorMessage)
      throw error instanceof Error 
        ? error 
        : new Error(errorMessage)
    } finally {
      setIsLoading(false)
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
