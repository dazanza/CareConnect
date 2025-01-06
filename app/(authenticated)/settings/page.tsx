'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/app/hooks/useSupabase'
import { useAuth } from '@/app/components/auth/SupabaseAuthProvider'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from 'react-hot-toast'
import { Loader2 } from 'lucide-react'

export default function SettingsPage() {
  const { supabase } = useSupabase()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: user?.email || '',
    first_name: '',
    last_name: '',
    notifications: {
      email: true,
      appointments: true,
      prescriptions: true
    },
    theme: 'light'
  })

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return

      try {
        // Try to get the user profile
        let { data: userData, error: userError } = await supabase
          .from('users')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single()

        // If user doesn't exist, create it
        if (userError?.code === 'PGRST116') {
          const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert({ 
              id: user.id,
              email: user.email,
              first_name: '',
              last_name: ''
            })
            .select()
            .single()

          if (insertError) throw insertError
          userData = newUser
        } else if (userError) {
          throw userError
        }

        // Fetch user settings
        const { data: settingsData, error: settingsError } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .single()

        // If settings don't exist, create them with defaults
        if (settingsError?.code === 'PGRST116') {
          const { data: newSettings, error: insertError } = await supabase
            .from('user_settings')
            .insert({ 
              user_id: user.id,
              email_notifications: true,
              appointment_notifications: true,
              prescription_notifications: true,
              theme: 'light'
            })
            .select()
            .single()

          if (insertError) throw insertError
          
          if (newSettings) {
            setFormData(prev => ({
              ...prev,
              email: user?.email || '',
              first_name: userData?.first_name || '',
              last_name: userData?.last_name || '',
              notifications: {
                email: newSettings.email_notifications,
                appointments: newSettings.appointment_notifications,
                prescriptions: newSettings.prescription_notifications
              },
              theme: newSettings.theme
            }))
          }
        } else if (settingsError) {
          throw settingsError
        } else if (settingsData) {
          setFormData(prev => ({
            ...prev,
            email: user?.email || '',
            first_name: userData?.first_name || '',
            last_name: userData?.last_name || '',
            notifications: {
              email: settingsData.email_notifications,
              appointments: settingsData.appointment_notifications,
              prescriptions: settingsData.prescription_notifications
            },
            theme: settingsData.theme
          }))
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
        toast.error('Failed to load user profile')
      }
    }

    fetchUserProfile()
  }, [user, supabase])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleNotificationToggle = (key: keyof typeof formData.notifications) => {
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key]
      }
    }))
  }

  const handleSaveProfile = async () => {
    setIsLoading(true)
    try {
      // Update user profile
      const { error: userError } = await supabase
        .from('users')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name
        })
        .eq('id', user?.id)

      if (userError) throw userError

      // Update user settings
      const { error: settingsError } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user?.id,
          email_notifications: formData.notifications.email,
          appointment_notifications: formData.notifications.appointments,
          prescription_notifications: formData.notifications.prescriptions,
          theme: formData.theme
        })

      if (settingsError) throw settingsError
      toast.success('Settings saved successfully')
    } catch (error) {
      console.error('Error saving settings:', error)
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
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  placeholder="Enter your first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  placeholder="Enter your last name"
                />
              </div>
              <Button 
                onClick={handleSaveProfile}
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6 mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose what notifications you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={formData.notifications.email}
                  onCheckedChange={() => handleNotificationToggle('email')}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Appointment Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about upcoming appointments
                  </p>
                </div>
                <Switch
                  checked={formData.notifications.appointments}
                  onCheckedChange={() => handleNotificationToggle('appointments')}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Prescription Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about prescription changes
                  </p>
                </div>
                <Switch
                  checked={formData.notifications.prescriptions}
                  onCheckedChange={() => handleNotificationToggle('prescriptions')}
                />
              </div>
              <Button 
                onClick={handleSaveProfile}
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Preferences
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
                      onClick={() => setFormData(prev => ({ ...prev, theme: 'light' }))}
                    >
                      Light
                    </Button>
                    <Button
                      variant={formData.theme === 'dark' ? 'default' : 'outline'}
                      onClick={() => setFormData(prev => ({ ...prev, theme: 'dark' }))}
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