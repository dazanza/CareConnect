'use server'

import { Resend } from 'resend'
import { createServerSupabaseClient } from '@/app/lib/supabase-server'

const resend = new Resend(process.env.RESEND_API_KEY)

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
    const { data: patient } = await supabase
      .from('patients')
      .select('name')
      .eq('id', patientId)
      .single()

    if (!patient) throw new Error('Patient not found')

    // Generate sign-up/sign-in link with share token
    const signUpUrl = new URL('/auth/sign-up', process.env.NEXT_PUBLIC_APP_URL);;
    signUpUrl.searchParams.set('share_id', shareId)
    signUpUrl.searchParams.set('email', email)

    await resend.emails.send({
      from: 'Health App <notifications@your-domain.com>',
      to: email,
      subject: `You've been invited to view patient records`,
      react: EmailTemplate({
        patientName: patient.name,
        accessLevel,
        invitedBy,
        signUpUrl: signUpUrl.toString(),
      })
    })

    return { success: true }
  } catch (error) {
    console.error('Error sending invitation:', error)
    return { success: false, error }
  }
}

function EmailTemplate({
  patientName,
  accessLevel,
  invitedBy,
  signUpUrl
}: {
  patientName: string
  accessLevel: string
  invitedBy: string
  signUpUrl: string
}) {
  return (
    <div>
      <h1>You've been invited to view patient records</h1>
      <p>Hello,</p>
      <p>
        You've been invited by {invitedBy} to access medical records for patient {patientName} with {accessLevel} access.
      </p>
      <p>
        To accept this invitation, please click the link below:
      </p>
      <a href={signUpUrl}>Accept Invitation</a>
      <p>
        This link will expire in 7 days.
      </p>
      <p>
        If you already have an account, you can sign in directly and the share will be automatically activated.
      </p>
    </div>
  )
} 