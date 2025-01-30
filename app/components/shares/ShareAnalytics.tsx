/**
 * Component for displaying share analytics with charts
 */
'use client'

import { useQuery } from '@tanstack/react-query'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import type { ShareAnalytics } from '@/types/shares'

interface ShareAnalyticsProps {
  /** CSS class name */
  className?: string
}

// Colors for the pie chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28']

/**
 * Component for displaying share analytics dashboard
 */
export function ShareAnalytics({ className }: ShareAnalyticsProps) {
  // Fetch analytics data
  const { data, isLoading, error } = useQuery({
    queryKey: ['shareAnalytics'],
    queryFn: async () => {
      const res = await fetch('/api/shares/analytics')
      if (!res.ok) throw new Error('Failed to fetch analytics')
      return res.json() as Promise<ShareAnalytics>
    },
    // Refresh every minute
    refetchInterval: 60000
  })

  if (error) {
    return <div>Error loading analytics</div>
  }

  // Transform data for pie chart
  const pieData = data ? [
    { name: 'Read', value: data.shares_by_access_level.read },
    { name: 'Write', value: data.shares_by_access_level.write },
    { name: 'Admin', value: data.shares_by_access_level.admin }
  ] : []

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total active shares */}
      <Card>
        <CardHeader>
          <CardTitle>Active Shares</CardTitle>
          <CardDescription>Total active patient shares</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="text-2xl font-bold">
              {data?.total_active_shares}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending invitations */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Invites</CardTitle>
          <CardDescription>Unclaimed share invitations</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="text-2xl font-bold">
              {data?.pending_invitations}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expiring soon */}
      <Card>
        <CardHeader>
          <CardTitle>Expiring Soon</CardTitle>
          <CardDescription>Shares expiring in 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="text-2xl font-bold">
              {data?.expiring_soon}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Average claim time */}
      <Card>
        <CardHeader>
          <CardTitle>Avg. Claim Time</CardTitle>
          <CardDescription>Hours to claim invitation</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="text-2xl font-bold">
              {data?.avg_time_to_claim.toFixed(1)}h
            </div>
          )}
        </CardContent>
      </Card>

      {/* Access level distribution */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Access Level Distribution</CardTitle>
          <CardDescription>Breakdown of share access levels</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[300px]" />
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => 
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 