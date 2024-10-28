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
      .from('documents')
      .select('*')
      .eq('patient_id', patientId)
      .order('uploaded_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.patient_id || !body.name || !body.type || !body.size || !body.url) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('documents')
      .insert(body)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating document:', error)
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  
  if (!id) {
    return NextResponse.json({ error: 'Document ID is required' }, { status: 400 })
  }

  const supabase = createRouteHandlerClient({ cookies })

  try {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    )
  }
}
