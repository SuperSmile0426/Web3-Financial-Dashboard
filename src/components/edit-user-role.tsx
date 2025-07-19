'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useContract } from '@/hooks/use-contract'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UserRole } from '@/types/contracts'

const roleSchema = z.object({
  newRole: z.nativeEnum(UserRole, { required_error: 'Please select a role' })
})

type RoleFormData = z.infer<typeof roleSchema>

interface EditUserRoleProps {
  userAddress: string
  currentRole: number
  userName: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function EditUserRole({ userAddress, currentRole, userName, onSuccess, onCancel }: EditUserRoleProps) {
  const { useUpdateUserRole } = useContract()
  const updateUserRole = useUpdateUserRole()
  const [isOpen, setIsOpen] = useState(false)

  const form = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      newRole: currentRole as UserRole
    }
  })

  const onSubmit = async (data: RoleFormData) => {
    try {
      await updateUserRole.mutateAsync({
        userAddress: userAddress,
        newRole: data.newRole
      })
      
      form.reset()
      setIsOpen(false)
      onSuccess?.()
    } catch (error) {
      console.error('Failed to update user role:', error)
    }
  }

  const getRoleText = (role: number): string => {
    switch (role) {
      case 0: return 'Regular'
      case 1: return 'Manager'
      case 2: return 'Admin'
      default: return 'Unknown'
    }
  }

  if (!isOpen) {
    return (
      <Button 
        size="sm" 
        variant="outline"
        onClick={() => setIsOpen(true)}
      >
        Edit
      </Button>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit User Role</CardTitle>
        <CardDescription>
          Update role for user: {userName} ({userAddress})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Current Role:</strong> {getRoleText(currentRole)}
              </p>
            </div>
            
            <FormField
              control={form.control}
              name="newRole"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Role</FormLabel>
                  <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a new role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={UserRole.Regular.toString()}>Regular User</SelectItem>
                      <SelectItem value={UserRole.Manager.toString()}>Manager</SelectItem>
                      <SelectItem value={UserRole.Admin.toString()}>Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex gap-2">
              <Button 
                type="submit" 
                disabled={updateUserRole.isPending}
                className="flex-1"
              >
                {updateUserRole.isPending ? 'Updating...' : 'Update Role'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsOpen(false)
                  onCancel?.()
                }}
                disabled={updateUserRole.isPending}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
} 