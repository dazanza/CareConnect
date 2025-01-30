import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema for query parameters
const QuerySchema = z.object({
  shareId: z.string().uuid().optional(),
  action: z.enum(['created', 'modified', 'expired', 'revoked']).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

/**
 * GET /api/shares/audit
 * Fetches audit logs with pagination and optional filtering
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = QuerySchema.parse(Object.fromEntries(searchParams))
    
    const supabase = createRouteHandlerClient({ cookies })
    
    // Build the base query
    let dbQuery = supabase
      .from('share_audit_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
    
    // Apply filters
    if (query.shareId) {
      dbQuery = dbQuery.eq('share_id', query.shareId)
    }
    if (query.action) {
      dbQuery = dbQuery.eq('action', query.action)
    }
    if (query.from) {
      dbQuery = dbQuery.gte('created_at', query.from)
    }
    if (query.to) {
      dbQuery = dbQuery.lte('created_at', query.to)
    }
    
    // Add pagination
    const from = (query.page - 1) * query.limit
    const to = from + query.limit - 1
    dbQuery = dbQuery.range(from, to)
    
    const { data: logs, count, error } = await dbQuery
    
    if (error) throw error
    
    return NextResponse.json({
      logs,
      pagination: {
        page: query.page,
        limit: query.limit,
        total: count,
        pages: count ? Math.ceil(count / query.limit) : 0
      }
    })
    
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    )
  }
} 