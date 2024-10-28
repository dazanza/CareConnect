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
      .from('allergies')
      .select('*')
      .eq('patient_id', patientId)
      .order('date_identified', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching allergies:', error)
    return NextResponse.json(
      { error: 'Failed to fetch allergies' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.patient_id || !body.allergen || !body.reaction || 
        !body.severity || !body.date_identified) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate severity
    if (!['mild', 'moderate', 'severe'].includes(body.severity)) {
      return NextResponse.json(
        { error: 'Invalid severity value' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('allergies')
      .insert(body)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating allergy:', error)
    return NextResponse.json(
      { error: 'Failed to create allergy' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  
  try {
    const { id, status } = await request.json()
    
    if (!id || !['active', 'inactive'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid ID or status' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('allergies')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating allergy:', error)
    return NextResponse.json(
      { error: 'Failed to update allergy' },
      { status: 500 }
    )
  }
}
