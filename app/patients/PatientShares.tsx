"use client";

import { useState } from "react";
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
import { toast } from "sonner";

interface PatientSharesProps {
  patientId: number;
}

interface Share {
  id: string;
  shared_with_user_id: string;
  access_level: string;
  expires_at: string | null;
}

export function PatientShares({ patientId }: PatientSharesProps) {
  const [email, setEmail] = useState("");
  const [accessLevel, setAccessLevel] = useState("read");
  const [shares, setShares] = useState<Share[]>([]);
  const supabase = useSupabase();

  const handleShare = async () => {
    try {
      // First get the user ID for the email
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .single();

      if (userError || !userData) {
        toast.error("User not found");
        return;
      }

      // Create the share
      const { error: shareError } = await supabase
        .from("patient_shares")
        .insert({
          patient_id: patientId,
          shared_with_user_id: userData.id,
          access_level: accessLevel,
        });

      if (shareError) {
        toast.error("Failed to share patient");
        return;
      }

      toast.success("Patient shared successfully");
      loadShares();
      setEmail("");
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const loadShares = async () => {
    const { data, error } = await supabase
      .from("patient_shares")
      .select(`
        id,
        shared_with_user_id,
        access_level,
        expires_at,
        users:shared_with_user_id (email)
      `)
      .eq("patient_id", patientId);

    if (error) {
      toast.error("Failed to load shares");
      return;
    }

    setShares(data || []);
  };

  const removeShare = async (shareId: string) => {
    const { error } = await supabase
      .from("patient_shares")
      .delete()
      .eq("id", shareId);

    if (error) {
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
          <Select value={accessLevel} onValueChange={setAccessLevel}>
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
              <p>{(share as any).users?.email}</p>
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