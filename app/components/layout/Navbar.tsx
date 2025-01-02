'use client'

import { UserNav } from '@/app/components/layout/UserNav'
import { NotificationsPopover } from '@/app/components/notifications/NotificationsPopover'

export function Navbar() {
  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="ml-auto flex items-center space-x-4">
          <NotificationsPopover />
          <UserNav />
        </div>
      </div>
    </nav>
  )
}
