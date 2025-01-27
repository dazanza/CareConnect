'use server'

import { Resend } from 'resend'
import { createServerSupabaseClient } from '@/app/lib/supabase-server'
import ShareInvitationEmail from '@/app/components/emails/ShareInvitationEmail'

const resend = new Resend(process.env.RESEND_API_KEY)
const SHARE_EXPIRY_DAYS = 7

export async function sendShareInvitation({
  email,
  patientId,
  shareId,
  accessLevel,
  invitedBy
}: {
  email: string
  patientId: number
  shareId: string
  accessLevel: string
  invitedBy: string
}) {
  const supabase = await createServerSupabaseClient()
  
  try {
    // Get patient details
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('first_name, last_name')
      .eq('id', patientId)
      .single()

    if (patientError) {
      console.error('Error fetching patient:', patientError)
      throw new Error('Failed to fetch patient details')
    }

    if (!patient) {
      throw new Error('Patient not found')
    }

    // Generate sign-up/sign-in link with share token
    const signUpUrl = new URL('/auth/sign-up', process.env.NEXT_PUBLIC_APP_URL)
    signUpUrl.searchParams.set('share_id', shareId)
    signUpUrl.searchParams.set('email', email)

    // Format patient name
    const patientName = `${patient.first_name} ${patient.last_name}`

    // Send email using our new template
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'Health App <notifications@your-domain.com>',
      to: email,
      subject: `Medical Records Access Invitation`,
      react: ShareInvitationEmail({
        patientName,
        accessLevel,
        invitedBy,
        signUpUrl: signUpUrl.toString(),
        expiresInDays: SHARE_EXPIRY_DAYS,
      }) as React.ReactElement,
    })

    if (emailError) {
      console.error('Error sending email:', emailError)
      throw new Error('Failed to send invitation email')
    }

    return { 
      success: true, 
      data: { 
        messageId: emailData?.id,
        sentTo: email 
      } 
    }
  } catch (error) {
    console.error('Error in sendShareInvitation:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    }
  }
} 