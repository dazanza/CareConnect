'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSupabase } from '@/app/hooks/useSupabase'
import { useAuth } from '@/app/components/auth/SupabaseAuthProvider'
import { useTheme } from '@/app/providers'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { showToast } from '@/app/lib/toast'
import { Loader2 } from 'lucide-react'

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const { supabase } = useSupabase()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email_notifications: false,
    theme: theme,
  })

  const fetchUserProfile = useCallback(async () => {
    if (!supabase || !user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setFormData(prev => ({
        ...prev,
        ...data
      }));
    } catch (error) {
      console.error('Error fetching user profile:', error);
      showToast.error('Failed to load user profile');
    } finally {
      setIsLoading(false);
    }
  }, [supabase, user]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

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

      showToast.success('Settings saved successfully')
    } catch (error) {
      console.error('Error saving profile:', error)
      showToast.error('Failed to save settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user) return
    if (deleteConfirmation !== user.email) {
      showToast.error('Please enter your email correctly to confirm deletion')
      return
    }

    setIsLoading(true)
    try {
      const { error: userError } = await supabase
        .from('users')
        .update({ 
          deleted_at: new Date().toISOString(),
          is_deleted: true 
        })
        .eq('id', user.id)

      if (userError) throw userError

      await signOut()
      router.push('/sign-in')
      showToast.success('Account deleted successfully')
    } catch (error) {
      console.error('Error deleting account:', error)
      showToast.error('Failed to delete account')
    } finally {
      setIsLoading(false)
      setShowDeleteDialog(false)
    }
  }

  return (
    <>
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
                  <Button 
                    variant="destructive"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              <p className="mb-4">
                This action cannot be undone. This will permanently delete your account
                and remove your data from our servers.
              </p>
              <div className="space-y-2">
                <Label htmlFor="confirmEmail">
                  Type <span className="font-semibold">{user?.email}</span> to confirm
                </Label>
                <Input
                  id="confirmEmail"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmation('')}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleteConfirmation !== user?.email || isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 