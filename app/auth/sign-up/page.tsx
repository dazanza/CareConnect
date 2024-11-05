'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSupabase } from '@/app/hooks/useSupabase'
import { SignUp } from "@clerk/nextjs"
import { toast } from 'react-hot-toast'

export default function SignUpPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { supabase } = useSupabase()
  
  useEffect(() => {
    const shareId = searchParams.get('share_id')
    const email = searchParams.get('email')
    
    if (shareId && email) {
      // Store the share info in localStorage to handle after sign-up
      localStorage.setItem('pendingShare', JSON.stringify({ shareId, email }))
    }
  }, [searchParams])

  const handleSignUpComplete = async () => {
    const pendingShareStr = localStorage.getItem('pendingShare')
    if (!pendingShareStr) return

    try {
      const { shareId, email } = JSON.parse(pendingShareStr)
      
      // Get the pending share details
      const { data: pendingShare, error: shareError } = await supabase
        .from('pending_shares')
        .select('*')
        .eq('id', shareId)
        .eq('email', email)
        .single()

      if (shareError || !pendingShare) {
        toast.error('Invalid or expired invitation')
        return
      }

      // Create the actual share
      const { error: createShareError } = await supabase
        .from('patient_shares')
        .insert({
          patient_id: pendingShare.patient_id,
          shared_with_user_id: (await supabase.auth.getUser()).data.user?.id,
          shared_by_user_id: pendingShare.shared_by_user_id,
          access_level: pendingShare.access_level,
          expires_at: pendingShare.expires_at
        })

      if (createShareError) {
        console.error('Error creating share:', createShareError)
        toast.error('Failed to activate share')
        return
      }

      // Mark pending share as claimed
      await supabase
        .from('pending_shares')
        .update({
          claimed_at: new Date().toISOString(),
          claimed_by_user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', shareId)

      localStorage.removeItem('pendingShare')
      toast.success('Patient access granted successfully')
      router.push('/dashboard')
    } catch (error) {
      console.error('Error handling share:', error)
      toast.error('Failed to process invitation')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Create your account
          </h2>
          {searchParams.get('share_id') && (
            <p className="mt-2 text-sm text-gray-600">
              You've been invited to access patient records
            </p>
          )}
        </div>

        <SignUp 
          afterSignUpUrl="/dashboard"
          redirectUrl="/dashboard"
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-none"
            }
          }}
          afterSignUp={handleSignUpComplete}
        />
      </div>
    </div>
  )
} 