"use client";

import { useAuth, useSignIn } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function SignInButton() {
  const { isSignedIn } = useAuth();
  const { signOut } = useAuth();
  const { openSignIn } = useSignIn();

  const handleClick = async () => {
    if (isSignedIn) {
      await signOut();
    } else {
      openSignIn();
    }
  };

  return (
    <Button 
      onClick={handleClick}
      variant="outline"
    >
      {isSignedIn ? "Sign Out" : "Sign In"}
    </Button>
  );
}