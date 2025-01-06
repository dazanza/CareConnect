import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus } from 'lucide-react'
import AddLogForm from '@/app/components/AddLogForm'
import { LogList } from '@/app/components/logs/LogList'
import { LogAnalytics } from '@/app/components/logs/LogAnalytics'

export const dynamic = 'force-dynamic'

export default async function LogsPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Fetch patients and doctors for the form
  const { data: patients } = await supabase
    .from('patients')
    .select('id, first_name, last_name, nickname')
    .eq('user_id', session.user.id)
    .is('deleted_at', null)
    .order('first_name')

  const { data: doctors } = await supabase
    .from('doctors')
    .select('id, first_name, last_name')
    .eq('user_id', session.user.id)
    .order('first_name')

  // Fetch logs with related data
  const { data: logs } = await supabase
    .from('logs')
    .select(`
      *,
      patient:patients (
        id,
        first_name,
        last_name,
        nickname
      ),
      doctor:doctors (
        id,
        first_name,
        last_name
      )
    `)
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Logs</h1>
          <p className="text-muted-foreground">
            View and manage patient logs and analytics
          </p>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="all" className="flex-1 sm:flex-none">All Logs</TabsTrigger>
          <TabsTrigger value="analytics" className="flex-1 sm:flex-none">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6 mt-0">
          <LogList 
            logs={logs || []} 
            patients={patients || []} 
            doctors={doctors || []} 
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6 mt-0">
          <LogAnalytics logs={logs || []} />
        </TabsContent>
      </Tabs>
    </div>
  )
} 