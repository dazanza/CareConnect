"use client";

import { SignInButton as ClerkSignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function SignInButton() {
  return (
    <ClerkSignInButton mode="modal">
      <Button size="lg" className="px-8">
        Get Started <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </ClerkSignInButton>
  );
}