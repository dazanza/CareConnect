import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Doctor } from '@/types'

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { first_name, last_name, specialization, contact_number, email, address, assistant } = await request.json()

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError) throw new Error(`Failed to get user: ${userError.message}`)

    const doctorData: Partial<Doctor> = {
      first_name,
      last_name,
      specialization,
      contact_number,
      address,
      user_id: userData.user?.id?.toString(), // Ensure it's a string
      created_at: new Date().toISOString(),
    }

    if (email) doctorData.email = email
    if (assistant) doctorData.assistant = assistant

    const { data, error } = await supabase
      .from('doctors')
      .insert(doctorData)
      .select()

    if (error) throw new Error(`Failed to insert doctor: ${error.message}`)

    return NextResponse.json(data[0])
  } catch (error) {
    console.error('Error in POST /api/doctors:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search')

  try {
    console.log('Fetching doctors from API...')
    let query = supabase.from('doctors').select('*')

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,specialization.ilike.%${search}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error in GET /api/doctors:', error)
      throw error
    }

    console.log('Fetched doctors:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in GET /api/doctors:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}