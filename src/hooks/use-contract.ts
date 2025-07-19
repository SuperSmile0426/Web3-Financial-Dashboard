'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useWeb3 } from '@/components/web3-provider'
import { ContractService } from '@/lib/contract-service'
import { UserRole, TransactionStatus, ApprovalStatus } from '@/types/contracts'
import { toast } from 'sonner'

export function useContract() {
  const { contract, provider, signer, account } = useWeb3()
  const queryClient = useQueryClient()

  // Create contract service instance
  const getContractService = () => {
    if (!contract || !provider || !signer) {
      throw new Error('Contract not initialized')
    }
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!
    return new ContractService(contractAddress, provider, signer, contract)
  }

  // Helper function to check if current user is admin
  const useIsAdmin = () => {
    const currentUser = useCurrentUser()
    return currentUser.data?.role === 2 // UserRole.Admin = 2
  }

  // User queries
  const useUser = (address: string) => {
    return useQuery({
      queryKey: ['user', address],
      queryFn: async () => {
        const service = getContractService()
        return service.getUser(address)
      },
      enabled: !!address && !!contract,
      retry: (failureCount, error) => {
        // Don't retry if user doesn't exist (null return)
        if (error && typeof error === 'object' && 'message' in error && 
            error.message.includes('Failed to get user')) {
          return false
        }
        return failureCount < 3
      }
    })
  }

  const useCurrentUser = () => {
    return useUser(account || '')
  }

  const useAllUsers = (isAdmin: boolean = false) => {
    return useQuery({
      queryKey: ['all-users'],
      queryFn: async () => {
        try {
          const service = getContractService()
          
          // Only proceed if user is admin
          if (!isAdmin) {
            throw new Error("Admin privileges required to view all users")
          }
          
          const userAddresses = await service.getAllUsers()
          
          if (!userAddresses || userAddresses.length === 0) {
            return []
          }
          
          const users = await Promise.all(
            userAddresses.map(async (address, index) => {
              try {
                const user = await service.getUser(address)
                return user
              } catch (error) {
                console.error(`Error fetching user ${address}:`, error)
                return null
              }
            })
          )
          
          const validUsers = users.filter(user => user !== null)
          return validUsers
        } catch (error) {
          console.error("Error in useAllUsers:", error)
          throw error
        }
      },
      enabled: !!contract && !!account && isAdmin,
      retry: (failureCount, error) => {
        // Don't retry if it's an admin role error or privilege error
        if (error && typeof error === 'object' && 'message' in error && 
            (error.message.includes('Admin role required') || 
             error.message.includes('Admin privileges required'))) {
          return false
        }
        return failureCount < 3
      }
    })
  }

  // Transaction queries
  const useTransaction = (id: bigint) => {
    return useQuery({
      queryKey: ['transaction', id.toString()],
      queryFn: async () => {
        const service = getContractService()
        return service.getTransaction(id)
      },
      enabled: !!id && !!contract,
    })
  }

  const useUserTransactions = (userAddress: string) => {
    return useQuery({
      queryKey: ['user-transactions', userAddress],
      queryFn: async () => {
        const service = getContractService()
        const transactionIds = await service.getUserTransactions(userAddress)
        // If no transactions, return empty array
        if (!transactionIds || transactionIds.length === 0) {
          return []
        }
        const transactions = await Promise.all(
          transactionIds.map(id => service.getTransaction(id))
        )
        return transactions
      },
      enabled: !!userAddress && !!contract,
    })
  }

  const useCurrentUserTransactions = () => {
    return useUserTransactions(account || '')
  }

  const useRecentTransactions = (count: bigint = BigInt(10)) => {
    return useQuery({
      queryKey: ['recent-transactions', count.toString()],
      queryFn: async () => {
        const service = getContractService()
        const transactionIds = await service.getRecentTransactions(count)
        // If no transactions, return empty array
        if (!transactionIds || transactionIds.length === 0) {
          return []
        }
        const transactions = await Promise.all(
          transactionIds.map(id => service.getTransaction(id))
        )
        return transactions
      },
      enabled: !!contract,
    })
  }

  const useAllTransactions = () => {
    return useQuery({
      queryKey: ['all-transactions'],
      queryFn: async () => {
        const service = getContractService()
        const transactionIds = await service.getAllTransactions()
        // If no transactions, return empty array
        if (!transactionIds || transactionIds.length === 0) {
          return []
        }
        const transactions = await Promise.all(
          transactionIds.map(id => service.getTransaction(id))
        )
        return transactions
      },
      enabled: !!contract,
      retry: (failureCount, error) => {
        // Don't retry if it's an admin role error
        if (error && typeof error === 'object' && 'message' in error && 
            error.message.includes('Admin role required')) {
          return false
        }
        return failureCount < 3
      }
    })
  }

  // Approval queries
  const useApproval = (id: bigint) => {
    return useQuery({
      queryKey: ['approval', id.toString()],
      queryFn: async () => {
        const service = getContractService()
        return service.getApproval(id)
      },
      enabled: !!id && !!contract,
    })
  }

  const usePendingApprovals = (canViewApprovals: boolean = true) => {
    return useQuery({
      queryKey: ['pending-approvals'],
      queryFn: async () => {
        const service = getContractService()
        const approvalIds = await service.getPendingApprovals()
        // If no approvals, return empty array
        if (!approvalIds || approvalIds.length === 0) {
          return []
        }
        const approvals = await Promise.all(
          approvalIds.map(id => service.getApproval(id))
        )
        return approvals
      },
      enabled: !!contract && canViewApprovals,
    })
  }

  // Metrics queries
  const useTransactionCount = () => {
    return useQuery({
      queryKey: ['transaction-count'],
      queryFn: async () => {
        const service = getContractService()
        return service.getTransactionCount()
      },
      enabled: !!contract,
    })
  }

  const useApprovalCount = () => {
    return useQuery({
      queryKey: ['approval-count'],
      queryFn: async () => {
        const service = getContractService()
        return service.getApprovalCount()
      },
      enabled: !!contract,
    })
  }

  const useUserCount = () => {
    return useQuery({
      queryKey: ['user-count'],
      queryFn: async () => {
        const service = getContractService()
        return service.getUserCount()
      },
      enabled: !!contract,
    })
  }

  // Mutations
  const useCreateTransaction = () => {
    return useMutation({
      mutationFn: async ({ to, amount, description }: { to: string; amount: bigint; description: string }) => {
        const service = getContractService()
        return service.createTransaction(to, amount, description)
      },
      onSuccess: () => {
        toast.success('Transaction created successfully')
        queryClient.invalidateQueries({ queryKey: ['transaction'] })
        queryClient.invalidateQueries({ queryKey: ['user-transactions'] })
        queryClient.invalidateQueries({ queryKey: ['transaction-count'] })
      },
      onError: (error: Error) => {
        toast.error(`Failed to create transaction: ${error.message}`)
      }
    })
  }

  const useCompleteTransaction = () => {
    return useMutation({
      mutationFn: async (transactionId: bigint) => {
        const service = getContractService()
        return service.completeTransaction(transactionId)
      },
      onSuccess: () => {
        toast.success('Transaction completed successfully')
        queryClient.invalidateQueries({ queryKey: ['transaction'] })
        queryClient.invalidateQueries({ queryKey: ['user-transactions'] })
      },
      onError: (error: Error) => {
        toast.error(`Failed to complete transaction: ${error.message}`)
      }
    })
  }

  const useRequestApproval = () => {
    return useMutation({
      mutationFn: async ({ transactionId, reason }: { transactionId: bigint; reason: string }) => {
        const service = getContractService()
        return service.requestApproval(transactionId, reason)
      },
      onSuccess: () => {
        toast.success('Approval requested successfully')
        queryClient.invalidateQueries({ queryKey: ['approval'] })
        queryClient.invalidateQueries({ queryKey: ['pending-approvals'] })
        queryClient.invalidateQueries({ queryKey: ['approval-count'] })
        queryClient.invalidateQueries({ queryKey: ['transaction'] })
        queryClient.invalidateQueries({ queryKey: ['user-transactions'] })
      },
      onError: (error: Error) => {
        toast.error(`Failed to request approval: ${error.message}`)
      }
    })
  }

  const useProcessApproval = () => {
    return useMutation({
      mutationFn: async ({ approvalId, approved, reason }: { approvalId: bigint; approved: boolean; reason: string }) => {
        const service = getContractService()
        return service.processApproval(approvalId, approved, reason)
      },
      onSuccess: (_, { approved }) => {
        toast.success(`Approval ${approved ? 'approved' : 'rejected'} successfully`)
        queryClient.invalidateQueries({ queryKey: ['approval'] })
        queryClient.invalidateQueries({ queryKey: ['pending-approvals'] })
        queryClient.invalidateQueries({ queryKey: ['transaction'] })
        queryClient.invalidateQueries({ queryKey: ['user-transactions'] })
        queryClient.invalidateQueries({ queryKey: ['approval-count'] })
      },
      onError: (error: Error) => {
        toast.error(`Failed to process approval: ${error.message}`)
      }
    })
  }

  const useRegisterUser = () => {
    return useMutation({
      mutationFn: async ({ walletAddress, name, email, role }: { walletAddress: string; name: string; email: string; role: UserRole }) => {
        const service = getContractService()
        return service.registerUser(walletAddress, name, email, role)
      },
      onSuccess: () => {
        toast.success('User registered successfully')
        queryClient.invalidateQueries({ queryKey: ['user'] })
        queryClient.invalidateQueries({ queryKey: ['user-count'] })
      },
      onError: (error: Error) => {
        toast.error(`Failed to register user: ${error.message}`)
      }
    })
  }

  const useSelfRegister = () => {
    return useMutation({
      mutationFn: async ({ name, email }: { name: string; email: string }) => {
        const service = getContractService()
        return service.selfRegister(name, email)
      },
      onSuccess: () => {
        toast.success('Registration successful! Welcome to the platform.')
        queryClient.invalidateQueries({ queryKey: ['user'] })
        queryClient.invalidateQueries({ queryKey: ['user-count'] })
      },
      onError: (error: Error) => {
        toast.error(`Failed to register: ${error.message}`)
      }
    })
  }

  const useUpdateUserRole = () => {
    return useMutation({
      mutationFn: async ({ userAddress, newRole }: { userAddress: string; newRole: UserRole }) => {
        const service = getContractService()
        return service.updateUserRole(userAddress, newRole)
      },
      onSuccess: () => {
        toast.success('User role updated successfully')
        queryClient.invalidateQueries({ queryKey: ['user'] })
      },
      onError: (error: Error) => {
        toast.error(`Failed to update user role: ${error.message}`)
      }
    })
  }

  return {
    // Queries
    useUser,
    useCurrentUser,
    useAllUsers,
    useIsAdmin,
    useTransaction,
    useUserTransactions,
    useCurrentUserTransactions,
    useRecentTransactions,
    useAllTransactions,
    useApproval,
    usePendingApprovals,
    useTransactionCount,
    useApprovalCount,
    useUserCount,
    
    // Mutations
    useCreateTransaction,
    useCompleteTransaction,
    useRequestApproval,
    useProcessApproval,
    useRegisterUser,
    useSelfRegister,
    useUpdateUserRole,
  }
} 