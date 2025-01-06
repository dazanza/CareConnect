'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/app/hooks/useSupabase'
import { useAuth } from '@/app/components/auth/SupabaseAuthProvider'
import { useTheme } from '@/app/providers'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from 'react-hot-toast'
import { Loader2 } from 'lucide-react'

export default function SettingsPage() {
  const { user } = useAuth()
  const { supabase } = useSupabase()
  const { theme, setTheme } = useTheme()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email_notifications: false,
    theme: theme,
  })

  useEffect(() => {
    if (user) {
      fetchUserProfile()
    }
  }, [user])

  const fetchUserProfile = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('users')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single()

      if (error) throw error

      if (data) {
        setFormData(prev => ({
          ...prev,
          first_name: data.first_name || '',
          last_name: data.last_name || '',
        }))
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      toast.error('Failed to load user profile')
    }
  }

  const handleSaveProfile = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email || '',
          first_name: formData.first_name,
          last_name: formData.last_name,
        })

      if (error) throw error

      // Update theme
      setTheme(formData.theme)

      // Save user settings
      const { error: settingsError } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          email_notifications: formData.email_notifications,
          theme: formData.theme,
        })

      if (settingsError) throw settingsError

      toast.success('Settings saved successfully')
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Failed to save settings')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="profile" className="flex-1 sm:flex-none">Profile</TabsTrigger>
          <TabsTrigger value="notifications" className="flex-1 sm:flex-none">Notifications</TabsTrigger>
          <TabsTrigger value="account" className="flex-1 sm:flex-none">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6 mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.first_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.last_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                  />
                </div>
              </div>
              <Button 
                onClick={handleSaveProfile}
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6 mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications about appointments and updates via email
                  </p>
                </div>
                <Switch
                  checked={formData.email_notifications}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, email_notifications: checked }))}
                />
              </div>
              <Button 
                onClick={handleSaveProfile}
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Notifications
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6 mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Theme Preference</Label>
                  <div className="flex items-center space-x-4">
                    <Button
                      variant={formData.theme === 'light' ? 'default' : 'outline'}
                      onClick={() => {
                        setFormData(prev => ({ ...prev, theme: 'light' }))
                        setTheme('light')
                      }}
                    >
                      Light
                    </Button>
                    <Button
                      variant={formData.theme === 'dark' ? 'default' : 'outline'}
                      onClick={() => {
                        setFormData(prev => ({ ...prev, theme: 'dark' }))
                        setTheme('dark')
                      }}
                    >
                      Dark
                    </Button>
                  </div>
                </div>
                <Button 
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Settings
                </Button>
              </div>
              <div className="pt-4 border-t">
                <Button variant="destructive">
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 