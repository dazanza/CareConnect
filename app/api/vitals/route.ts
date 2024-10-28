import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { VitalsInput } from '@/types'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const patientId = searchParams.get('patientId')
  
  if (!patientId) {
    return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 })
  }

  const supabase = createRouteHandlerClient({ cookies })

  try {
    const { data, error } = await supabase
      .from('vitals')
      .select('*')
      .eq('patient_id', patientId)
      .order('date', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching vitals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vitals' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  
  try {
    const body: VitalsInput = await request.json()
    
    // Validate required fields
    if (!body.patient_id || !body.blood_pressure || !body.heart_rate || 
        !body.temperature || !body.oxygen_level) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate ranges
    if (body.heart_rate < 30 || body.heart_rate > 200) {
      return NextResponse.json(
        { error: 'Heart rate must be between 30 and 200' },
        { status: 400 }
      )
    }

    if (body.temperature < 35 || body.temperature > 42) {
      return NextResponse.json(
        { error: 'Temperature must be between 35°C and 42°C' },
        { status: 400 }
      )
    }

    if (body.oxygen_level < 70 || body.oxygen_level > 100) {
      return NextResponse.json(
        { error: 'Oxygen level must be between 70% and 100%' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('vitals')
      .insert({
        patient_id: body.patient_id,
        blood_pressure: body.blood_pressure,
        heart_rate: body.heart_rate,
        temperature: body.temperature,
        oxygen_level: body.oxygen_level,
        date: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating vitals entry:', error)
    return NextResponse.json(
      { error: 'Failed to create vitals entry' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  
  if (!id) {
    return NextResponse.json({ error: 'Vitals ID is required' }, { status: 400 })
  }

  const supabase = createRouteHandlerClient({ cookies })

  try {
    const { error } = await supabase
      .from('vitals')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting vitals:', error)
    return NextResponse.json(
      { error: 'Failed to delete vitals entry' },
      { status: 500 }
    )
  }
}
