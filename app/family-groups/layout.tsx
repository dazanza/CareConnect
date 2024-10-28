import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Family Groups',
  description: 'Manage your family groups and members',
}

export default function FamilyGroupsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="container mx-auto py-6">
      {children}
    </div>
  )
}
