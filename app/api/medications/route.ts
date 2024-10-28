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
      .from('medications')
      .select(`
        *,
        doctor:doctors(id, name)
      `)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching medications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch medications' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.patient_id || !body.doctor_id || !body.name || 
        !body.dosage || !body.frequency || !body.start_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate status if provided
    if (body.status && !['active', 'discontinued', 'completed'].includes(body.status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('medications')
      .insert(body)
      .select('*, doctor:doctors(id, name)')
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating medication:', error)
    return NextResponse.json(
      { error: 'Failed to create medication' },
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
        { error: 'Medication ID is required' },
        { status: 400 }
      )
    }

    // Validate status if updating
    if (updates.status && !['active', 'discontinued', 'completed'].includes(updates.status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('medications')
      .update(updates)
      .eq('id', id)
      .select('*, doctor:doctors(id, name)')
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating medication:', error)
    return NextResponse.json(
      { error: 'Failed to update medication' },
      { status: 500 }
    )
  }
}
