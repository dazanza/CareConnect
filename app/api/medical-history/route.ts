import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const patientId = searchParams.get('patientId')
  
  if (!patientId) {
    return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 })
  }

  const supabase = createRouteHandlerClient({ cookies })

  try {
    const { data, error } = await supabase
      .from('medical_history')
      .select(`
        *,
        doctor:doctors(id, name)
      `)
      .eq('patient_id', patientId)
      .order('date', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching medical history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch medical history' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  
  try {
    const body = await request.json()
    const { data, error } = await supabase
      .from('medical_history')
      .insert(body)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating medical history entry:', error)
    return NextResponse.json(
      { error: 'Failed to create medical history entry' },
      { status: 500 }
    )
  }
}
