'use client'

import { useState } from 'react'
import { useWeb3 } from '@/components/web3-provider'
import { useContract } from '@/hooks/use-contract'
import { UserRole } from '@/types/contracts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, Users, Shield, UserCheck, UserPlus, AlertCircle } from 'lucide-react'
import { NewUserForm } from './new-user-form'
import { EditUserRole } from './edit-user-role'

const registrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address')
})

type RegistrationFormData = z.infer<typeof registrationSchema>

function QuickRegistrationForm({ onSuccess }: { onSuccess: () => void }) {
  const { account } = useWeb3()
  const { useRegisterUser } = useContract()
  const registerUser = useRegisterUser()
  
  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: '',
      email: ''
    }
  })

  const onSubmit = async (data: RegistrationFormData) => {
    if (!account) {
      toast.error('No wallet connected')
      return
    }

    try {
      await registerUser.mutateAsync({
        walletAddress: account,
        name: data.name,
        email: data.email,
        role: UserRole.Regular
      })
      
      toast.success('User registered successfully!')
      form.reset()
      onSuccess()
    } catch (error) {
      toast.error('Failed to register user')
      console.error('Registration error:', error)
    }
  }

  return (
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
            disabled={registerUser.isPending}
          >
            {registerUser.isPending ? 'Registering...' : 'Register as Regular User'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export function UserManagement() {
  const { useAllUsers, useCurrentUser, useUserCount, useSelfRegister } = useContract()
  const { account } = useWeb3()
  const [showRegistration, setShowRegistration] = useState(false)
  
  // Fetch current user first to determine their role
  const currentUser = useCurrentUser()
  const userCount = useUserCount()
  const selfRegister = useSelfRegister()
  
  // Determine if user is admin
  const isAdmin = currentUser.data?.role === 2
  
  // Only fetch all users if current user is admin (role === 2)
  const allUsers = useAllUsers(isAdmin)
  
  // Determine what data to show based on user role
  const usersData = isAdmin ? (allUsers.data || []) : (currentUser.data ? [currentUser.data] : [])
  
  const users = usersData.map(user => ({
    id: user.id,
    address: user.walletAddress,
    name: user.name,
    email: user.email,
    role: getRoleText(user.role),
    isActive: user.isActive
  }))

  // Form for auto-registration modal
  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: '',
      email: ''
    }
  })

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
      currentUser.refetch()
    } catch (error) {
      toast.error('Failed to register user')
      console.error('Registration error:', error)
    }
  }

  function getRoleText(role: number): string {
    switch (role) {
      case 0: return 'Regular'
      case 1: return 'Manager'
      case 2: return 'Admin'
      default: return 'Unknown'
    }
  }

  function getRoleNumber(roleText: string): number {
    switch (roleText) {
      case 'Regular': return 0
      case 'Manager': return 1
      case 'Admin': return 2
      default: return 0
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Admin':
        return <Shield className="h-4 w-4 text-red-500" />
      case 'Manager':
        return <UserCheck className="h-4 w-4 text-blue-500" />
      default:
        return <Users className="h-4 w-4 text-gray-500" />
    }
  }

  const handleRegistrationSuccess = () => {
    setShowRegistration(false)
    currentUser.refetch()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-muted-foreground">
            {isAdmin ? 'Manage all users, roles, and permissions' : 'View your user profile'}
          </p>
        </div>
        <div className="flex gap-2">
          
          {/* Show add user button for admins */}
          {isAdmin && (
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Register New User</DialogTitle>
                  <DialogDescription>
                    Register a new user with the specified role and permissions
                  </DialogDescription>
                </DialogHeader>
                <NewUserForm />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {isAdmin ? 'All Users' : 'My Profile'}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {userCount.data ? `Total registered users: ${userCount.data.toString()}` : 'Loading user count...'}
          </p>
        </CardHeader>
        <CardContent>
          {(currentUser.isLoading || (isAdmin && allUsers.isLoading)) ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading user data...</p>
            </div>
          ) : (currentUser.isError || (isAdmin && allUsers.isError)) ? (
            <div className="text-center py-8">
              <p className="text-red-500">Failed to load user data</p>
              {currentUser.error && (
                <p className="text-sm text-red-400 mt-2">
                  Error: {currentUser.error.message}
                </p>
              )}
              {isAdmin && allUsers.error && (
                <p className="text-sm text-red-400 mt-2">
                  Error loading all users: {allUsers.error.message}
                </p>
              )}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No user data found</p>
              {!currentUser.data && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Your wallet is not registered. Please register to continue.
                  </p>
                  <Dialog open={showRegistration} onOpenChange={setShowRegistration}>
                    <DialogTrigger asChild>
                      <Button>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Register Now
                      </Button>
                    </DialogTrigger>
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
                </div>
              )}
            </div>
          ) : (
            <>
              {isAdmin ? (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Admin View:</strong> Showing all {users.length} registered users.
                  </p>
                </div>
              ) : (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>User Profile:</strong> Showing your account information. Only admin users can view all registered users.
                  </p>
                </div>
              )}
              <div className="space-y-4">
                {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    {getRoleIcon(user.role)}
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.email} • {user.address}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.role === 'Admin' 
                        ? 'bg-red-100 text-red-800' 
                        : user.role === 'Manager'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                    {isAdmin && (
                      <EditUserRole
                        userAddress={user.address}
                        currentRole={getRoleNumber(user.role)}
                        userName={user.name}
                        onSuccess={() => {
                          // Refresh the user data
                          currentUser.refetch()
                          allUsers.refetch()
                        }}
                      />
                    )}
                  </div>
                </div>
              ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 