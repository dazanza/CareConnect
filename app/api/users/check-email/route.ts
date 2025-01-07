import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

interface CheckUserExistsResponse {
  user_exists: boolean
  user_id: string | null
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')
  
  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  const supabase = createRouteHandlerClient({ cookies })

  try {
    const { data, error } = await supabase
      .rpc('check_user_exists', { 
        email_to_check: email 
      })
      .single<CheckUserExistsResponse>()

    if (error) {
      throw error
    }

    return NextResponse.json({
      exists: data.user_exists,
      userId: data.user_id
    })
  } catch (error) {
    console.error('Error checking email:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to check email' },
      { status: 500 }
    )
  }
} 