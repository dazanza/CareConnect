'use client'

import { UserButton } from "@clerk/nextjs"
import { NotificationsPopover } from '@/components/notifications/NotificationsPopover'

export function Navbar() {
  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="ml-auto flex items-center space-x-4">
          <NotificationsPopover />
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </nav>
  )
}
