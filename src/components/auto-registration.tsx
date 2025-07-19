'use client'

import { useState, useEffect } from 'react'
import { useWeb3 } from '@/components/web3-provider'
import { useContract } from '@/hooks/use-contract'
import { UserRole } from '@/types/contracts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { UserPlus, AlertCircle } from 'lucide-react'

const registrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address')
})

type RegistrationFormData = z.infer<typeof registrationSchema>

export function AutoRegistration() {
  const { account, isConnected } = useWeb3()
  const { useCurrentUser, useSelfRegister } = useContract()
  const [showRegistration, setShowRegistration] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  
  const currentUser = useCurrentUser()
  const selfRegister = useSelfRegister()
  
  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: '',
      email: ''
    }
  })

  // Check if user needs to be registered
  useEffect(() => {
    if (isConnected && account) {
      // Check if user query has failed or if user data is null/undefined
      if (currentUser.isError || 
          (currentUser.isSuccess && currentUser.data === null) ||
          (currentUser.data && !currentUser.data.isActive)) {
        setShowRegistration(true)
      }
      setIsChecking(false)
    } else {
      setShowRegistration(false)
      setIsChecking(false)
    }
  }, [isConnected, account, currentUser.isError, currentUser.isSuccess, currentUser.data])

  const onSubmit = async (data: RegistrationFormData) => {
    if (!account) {
      toast.error('No wallet connected')
      return
    }

    try {
      await selfRegister.mutateAsync({
        name: data.name,
        email: data.email
      })
      
      toast.success('User registered successfully!')
      setShowRegistration(false)
      form.reset()
      
      // Refresh user data
      currentUser.refetch()
    } catch (error) {
      toast.error('Failed to register user')
      console.error('Registration error:', error)
    }
  }

  // Don't show anything if not connected or still checking
  if (!isConnected || isChecking) {
    return null
  }

  // Don't show if user is already registered and active
  if (currentUser.data && currentUser.data.isActive) {
    return null
  }

  return (
    <Dialog open={showRegistration} onOpenChange={setShowRegistration}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5 text-blue-500" />
            <span>Welcome! Please Register</span>
          </DialogTitle>
          <DialogDescription>
            Your wallet address <code className="text-xs bg-gray-100 px-1 rounded">{account}</code> is not registered. 
            Please provide your details to create a new account with Regular user privileges.
          </DialogDescription>
        </DialogHeader>
        
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-sm">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <span>New User Registration</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-orange-700">
              You'll be registered as a Regular user. Contact an admin to upgrade your role if needed.
            </p>
          </CardContent>
        </Card>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your full name" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input 
                      type="email"
                      placeholder="Enter your email address" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-2">
              <Button 
                type="submit" 
                className="flex-1"
                disabled={selfRegister.isPending}
              >
                {selfRegister.isPending ? 'Registering...' : 'Register as Regular User'}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setShowRegistration(false)}
                disabled={selfRegister.isPending}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 