'use client'

import { FamilyGroup } from '@/types/family'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserPlus, Trash2 } from 'lucide-react'
import { format } from 'date-fns'

interface FamilyGroupCardProps {
  group: FamilyGroup
  onAddMember: () => void
  onDelete: () => void
}

export function FamilyGroupCard({ group, onAddMember, onDelete }: FamilyGroupCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle>{group.name}</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="text-red-600 hover:text-red-800 hover:bg-red-100"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              {group.members.length} members
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={onAddMember}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </div>
          <div className="space-y-2">
            {group.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(member.date_of_birth), 'MMM d, yyyy')}
                    {member.relationship && ` · ${member.relationship}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
