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
      .from('bills')
      .select(`
        *,
        service:services(name, code)
      `)
      .eq('patient_id', patientId)
      .order('date', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching bills:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bills' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.patient_id || !body.service_id || !body.amount || !body.description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate amount
    if (body.amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('bills')
      .insert(body)
      .select('*, service:services(name, code)')
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating bill:', error)
    return NextResponse.json(
      { error: 'Failed to create bill' },
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
        { error: 'Bill ID is required' },
        { status: 400 }
      )
    }

    // Validate status if updating
    if (updates.status && !['pending', 'paid', 'overdue', 'cancelled'].includes(updates.status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('bills')
      .update(updates)
      .eq('id', id)
      .select('*, service:services(name, code)')
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating bill:', error)
    return NextResponse.json(
      { error: 'Failed to update bill' },
      { status: 500 }
    )
  }
}
