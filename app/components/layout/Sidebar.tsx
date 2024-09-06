'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, Stethoscope, Calendar, PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

const navItems = [
  { name: 'Dashboard', icon: Home, href: '/dashboard' },
  { name: 'Patients', icon: Users, href: '/patients' },
  { name: 'Doctors', icon: Stethoscope, href: '/doctors' },
  { name: 'Appointments', icon: Calendar, href: '/dashboard/appointments' },
  { name: 'Prescriptions', icon: PlusCircle, href: '/dashboard/prescriptions' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r bg-white">
      <nav className="mt-6">
        {navItems.map((item) => (
          <Link href={item.href} key={item.name}>
            <Button
              variant={pathname === item.href ? "secondary" : "ghost"}
              className="w-full justify-start px-4 py-2 text-sm"
            >
              <item.icon className="mr-3 h-4 w-4" />
              {item.name}
            </Button>
          </Link>
        ))}
      </nav>
    </aside>
  )
}