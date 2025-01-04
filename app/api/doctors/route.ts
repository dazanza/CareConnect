import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Database } from '@/types/supabase'

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies })

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError) throw new Error(`Failed to get user: ${userError.message}`)
    if (!userData.user?.id) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .eq('user_id', userData.user.id.toString())
      .order('first_name')

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching doctors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch doctors' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError) throw new Error(`Failed to get user: ${userError.message}`)
    if (!userData.user?.id) throw new Error('User not authenticated')

    const body = await request.json()

    // Validate required fields
    if (!body.first_name || !body.last_name || !body.specialty) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('doctors')
      .insert({
        ...body,
        user_id: userData.user.id.toString()
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating doctor:', error)
    return NextResponse.json(
      { error: 'Failed to create doctor' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError) throw new Error(`Failed to get user: ${userError.message}`)
    if (!userData.user?.id) throw new Error('User not authenticated')

    const { id, ...updates } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Doctor ID is required' },
        { status: 400 }
      )
    }

    // First verify that the doctor belongs to the user
    const { data: doctorData, error: doctorError } = await supabase
      .from('doctors')
      .select('id')
      .eq('id', id)
      .eq('user_id', userData.user.id.toString())
      .single()

    if (doctorError) {
      throw new Error('Doctor not found or access denied')
    }

    const { data, error } = await supabase
      .from('doctors')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating doctor:', error)
    return NextResponse.json(
      { error: 'Failed to update doctor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  
  if (!id) {
    return NextResponse.json({ error: 'Doctor ID is required' }, { status: 400 })
  }

  const supabase = createRouteHandlerClient<Database>({ cookies })

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError) throw new Error(`Failed to get user: ${userError.message}`)
    if (!userData.user?.id) throw new Error('User not authenticated')

    // First verify that the doctor belongs to the user
    const { data: doctorData, error: doctorError } = await supabase
      .from('doctors')
      .select('id')
      .eq('id', id)
      .eq('user_id', userData.user.id.toString())
      .single()

    if (doctorError) {
      throw new Error('Doctor not found or access denied')
    }

    const { error } = await supabase
      .from('doctors')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting doctor:', error)
    return NextResponse.json(
      { error: 'Failed to delete doctor' },
      { status: 500 }
    )
  }
}