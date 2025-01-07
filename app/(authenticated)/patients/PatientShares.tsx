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

interface PatientSharesProps {
  patientId: number;
}

interface Share {
  id: string;
  shared_with_user_id: string;
  access_level: 'read' | 'write' | 'admin';
  expires_at: string | null;
  shared_with: {
    email: string;
    first_name?: string;
    last_name?: string;
  };
  is_pending?: boolean;
}

export function PatientShares({ patientId }: PatientSharesProps) {
  const [email, setEmail] = useState("");
  const [accessLevel, setAccessLevel] = useState<Share['access_level']>("read");
  const [shares, setShares] = useState<Share[]>([]);
  const { supabase } = useSupabase();

  const loadShares = useCallback(async () => {
    if (!supabase || !patientId) return;
    
    try {
      const shares = await getPatientShares(supabase, patientId);
      setShares(shares);
    } catch (error) {
      console.error('Error loading shares:', error);
      toast.error('Failed to load shares');
    }
  }, [supabase, patientId]);

  useEffect(() => {
    loadShares();
  }, [loadShares]);

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

      loadShares();
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
    loadShares();
  };

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
          <Select value={accessLevel} onValueChange={(value) => setAccessLevel(value as Share['access_level'])}>
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
                {share.shared_with.email}
                {share.is_pending && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                    Pending
                  </span>
                )}
              </p>
              {share.shared_with.first_name && (
                <p className="text-sm text-muted-foreground">
                  {share.shared_with.first_name} {share.shared_with.last_name}
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