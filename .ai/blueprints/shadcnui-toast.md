Add the Toaster component
app/layout.tsx
import { Toaster } from "@/components/ui/toaster"
 
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head />
      <body>
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  )
}
Copy
Usage
The useToast hook returns a toast function that you can use to display a toast.

import { useToast } from "@/hooks/use-toast"
Copy
export const ToastDemo = () => {
  const { toast } = useToast()
 
  return (
    <Button
      onClick={() => {
        toast({
          title: "Scheduled: Catch up",
          description: "Friday, February 10, 2023 at 5:57 PM",
        })
      }}
    >
      Show Toast
    </Button>
  )
}
Copy
To display multiple toasts at the same time, you can update the TOAST_LIMIT in use-toast.tsx.