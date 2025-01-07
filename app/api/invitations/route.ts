import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError) throw new Error(`Failed to get user: ${userError.message}`)
    if (!userData.user?.id) throw new Error('User not authenticated')

    const body = await request.json()
    const { email, patientId, accessLevel } = body

    if (!email || !patientId || !accessLevel) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create a pending share record
    const { data: pendingShare, error: pendingShareError } = await supabase
      .from('pending_shares')
      .insert({
        patient_id: patientId,
        email,
        access_level: accessLevel,
        shared_by_user_id: userData.user.id,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days expiry
      })
      .select()
      .single()

    if (pendingShareError) throw pendingShareError

    // Get patient details for the email
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('first_name, last_name')
      .eq('id', patientId)
      .single()

    if (patientError) throw patientError

    // Send invitation email using Supabase Auth
    const { error: emailError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        data: {
          pendingShareId: pendingShare.id,
          patientName: `${patient.first_name} ${patient.last_name}`,
          accessLevel
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/accept-invitation`
      }
    })

    if (emailError) throw emailError

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending invitation:', error)
    return NextResponse.json(
      { error: 'Failed to send invitation' },
      { status: 500 }
    )
  }
} 