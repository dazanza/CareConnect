import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { name, date_of_birth, gender, contact_number, address, medical_history } = await request.json()

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError) throw new Error(`Failed to get user: ${userError.message}`)

    const { data, error } = await supabase
      .from('patients')
      .insert({
        name,
        date_of_birth,
        gender,
        contact_number,
        address,
        medical_history,
        user_id: userData.user?.id
      })
      .select()

    if (error) throw new Error(`Failed to insert patient: ${error.message}`)

    return NextResponse.json(data[0])
  } catch (error) {
    console.error('Error in POST /api/patients:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search')

  let query = supabase.from('patients').select('*')

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data)
}

