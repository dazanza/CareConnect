import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * GET /api/shares/analytics
 * Fetches current share analytics
 */
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: analytics, error } = await supabase
      .from('share_analytics')
      .select('*')
      .order('calculated_at', { ascending: false })
      .limit(1)
      .single()
    
    if (error) throw error
    
    return NextResponse.json(analytics)
    
  } catch (error) {
    console.error('Error fetching share analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch share analytics' },
      { status: 500 }
    )
  }
} 