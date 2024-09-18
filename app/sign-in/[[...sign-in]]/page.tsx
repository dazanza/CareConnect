import { SignIn } from "@clerk/nextjs";
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function SignInPage() {
  const { userId } = await auth();

  if (userId) {
    redirect('/dashboard');
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <SignIn />
    </div>
  );
}