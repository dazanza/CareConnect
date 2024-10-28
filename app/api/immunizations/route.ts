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
      .from('immunizations')
      .select(`
        *,
        doctor:doctors(id, name)
      `)
      .eq('patient_id', patientId)
      .order('date_administered', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching immunizations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch immunizations' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.patient_id || !body.doctor_id || !body.vaccine_name || 
        !body.vaccine_type || !body.dose_number || !body.date_administered ||
        !body.administered_by || !body.batch_number || !body.manufacturer ||
        !body.location) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate status if provided
    if (body.status && !['completed', 'scheduled', 'overdue'].includes(body.status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('immunizations')
      .insert(body)
      .select('*, doctor:doctors(id, name)')
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating immunization:', error)
    return NextResponse.json(
      { error: 'Failed to create immunization' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  
  try {
    const { id, ...updates } = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { error: 'Immunization ID is required' },
        { status: 400 }
      )
    }

    // Validate status if updating
    if (updates.status && !['completed', 'scheduled', 'overdue'].includes(updates.status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('immunizations')
      .update(updates)
      .eq('id', id)
      .select('*, doctor:doctors(id, name)')
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating immunization:', error)
    return NextResponse.json(
      { error: 'Failed to update immunization' },
      { status: 500 }
    )
  }
}
