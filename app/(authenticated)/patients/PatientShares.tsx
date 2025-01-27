"use client";

import { useState, useEffect, useCallback } from "react";
import { useSupabase } from "@/app/hooks/useSupabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-hot-toast";
import { sendShareInvitation } from '@/app/actions/sendShareInvitation'
import { SupabaseClient } from '@supabase/supabase-js'

// Define types to match Supabase response structure
interface PatientShare {
  id: string
  patient_id: number
  shared_by_user_id: string
  shared_with_user_id: string
  access_level: string
  expires_at?: string
  users: {  // Changed from optional to required and single object
    id: string
    email: string
    full_name?: string
  }
}

interface PatientSharesProps {
  supabase: SupabaseClient
  patientId: number
}

/**
 * Fetches patient shares from the database
 * @param supabase - Supabase client instance
 * @param patientId - ID of the patient whose shares to fetch
 * @returns Array of patient shares with associated user details
 */
async function getPatientShares(supabase: SupabaseClient, patientId: number): Promise<PatientShare[]> {
  if (!patientId) return []
  
  const { data, error } = await supabase
    .from('patient_shares')
    .select(`
      id,
      patient_id,
      shared_by_user_id,
      shared_with_user_id,
      access_level,
      expires_at,
      users!inner (
        id,
        email,
        full_name
      )
    `)
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })

  if (error) throw error
  
  // Transform the data to match our type
  const transformedData: PatientShare[] = (data || []).map(share => ({
    ...share,
    users: share.users[0] // Take first user since it's a one-to-one relationship
  }))

  return transformedData
}

export function PatientShares({ supabase, patientId }: PatientSharesProps) {
  const [email, setEmail] = useState("");
  const [accessLevel, setAccessLevel] = useState<PatientShare['access_level']>("read");
  const [shares, setShares] = useState<PatientShare[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShares = useCallback(async () => {
    if (!supabase || !patientId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const data = await getPatientShares(supabase, patientId);
      setShares(data);
    } catch (err) {
      console.error('Error loading shares:', err);
      setError('Failed to load patient shares');
    } finally {
      setIsLoading(false);
    }
  }, [supabase, patientId]);

  useEffect(() => {
    fetchShares();
  }, [fetchShares]);

  const handleShare = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // First check if the user exists in our users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id, email")
        .eq("email", email)
        .single();

      if (userError) {
        // If user doesn't exist, create a pending share
        const { data: pendingShare, error: pendingShareError } = await supabase
          .from("pending_shares")
          .insert({
            patient_id: patientId,
            email: email,
            access_level: accessLevel,
            shared_by_user_id: user.id,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days expiry
          })
          .select()
          .single();

        if (pendingShareError) {
          console.error('Pending share error:', pendingShareError);
          toast.error("Failed to create share invitation");
          return;
        }

        // Send email invitation
        const { success, error } = await sendShareInvitation({
          email,
          patientId,
          shareId: pendingShare.id,
          accessLevel,
          invitedBy: user.email || 'A healthcare provider'
        });

        if (!success) {
          console.error('Failed to send invitation:', error);
          toast.error("Failed to send invitation email");
          return;
        }

        toast.success("Share invitation sent to " + email);
      } else {
        // If user exists, create the share directly
        const { error: shareError } = await supabase
          .from("patient_shares")
          .insert({
            patient_id: patientId,
            shared_with_user_id: userData.id,
            shared_by_user_id: user.id,
            access_level: accessLevel,
          });

        if (shareError) {
          console.error('Share error:', shareError);
          toast.error("Failed to share patient");
          return;
        }

        toast.success("Patient shared successfully with " + email);
      }

      fetchShares();
      setEmail("");
    } catch (error) {
      console.error('Share error:', error);
      toast.error("An error occurred");
    }
  };

  const removeShare = async (shareId: string) => {
    const { error } = await supabase
      .from("patient_shares")
      .delete()
      .eq("id", shareId);

    if (error) {
      console.error('Remove share error:', error);
      toast.error("Failed to remove share");
      return;
    }

    toast.success("Share removed");
    fetchShares();
  };

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (isLoading) {
    return <div>Loading shares...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Share with (email)</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="access">Access Level</Label>
          <Select value={accessLevel} onValueChange={(value) => setAccessLevel(value as PatientShare['access_level'])}>
            <SelectTrigger id="access">
              <SelectValue placeholder="Select access level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="read">Read</SelectItem>
              <SelectItem value="write">Write</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleShare}>Share Patient</Button>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-medium">Current Shares</h3>
        {shares.map((share) => (
          <div
            key={share.id}
            className="flex items-center justify-between p-2 border rounded"
          >
            <div>
              <p className="flex items-center gap-2">
                {share.users?.email}
                {share.expires_at && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                    Expires: {new Date(share.expires_at).toLocaleDateString()}
                  </span>
                )}
              </p>
              {share.users?.full_name && (
                <p className="text-sm text-muted-foreground">
                  {share.users.full_name}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Access: {share.access_level}
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => removeShare(share.id)}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}