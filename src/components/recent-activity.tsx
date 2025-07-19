'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Clock, 
  UserPlus 
} from 'lucide-react'
import { useWeb3 } from '@/components/web3-provider'
import { useContract } from '@/hooks/use-contract'
import { ContractService } from '@/lib/contract-service'
import { ethers } from 'ethers'

interface ActivityEvent {
  id: string
  type: 'transaction' | 'approval' | 'user' | 'completion'
  action: string
  description: string
  timestamp: Date
  status: 'success' | 'pending' | 'rejected'
  amount?: string
  from?: string
  to?: string
}

export function RecentActivity() {
  const [activities, setActivities] = useState<ActivityEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const { contract, provider, signer } = useWeb3()
  const { useTransactionCount, useApprovalCount, useUserCount } = useContract()
  const transactionCount = useTransactionCount()
  const approvalCount = useApprovalCount()
  const userCount = useUserCount()

  useEffect(() => {
    if (!contract || !provider || !signer) {
      setIsLoading(false)
      return
    }

    // Create contract service instance with the existing ABI
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!
    const contractService = new ContractService(contractAddress, provider, signer)

    const handleTransactionCreated = (transactionId: bigint, from: string, to: string, amount: bigint) => {
      const newActivity: ActivityEvent = {
        id: `tx-${transactionId}`,
        type: 'transaction',
        action: 'Transaction Created',
        description: `New transaction from ${from.slice(0, 6)}...${from.slice(-4)} to ${to.slice(0, 6)}...${to.slice(-4)}`,
        timestamp: new Date(),
        status: 'pending',
        amount: ethers.formatEther(amount),
        from,
        to
      }
      setActivities(prev => [newActivity, ...prev.slice(0, 9)])
    }

    const handleTransactionStatusUpdated = (transactionId: bigint, status: number) => {
      const statusText = status === 0 ? 'Pending' : status === 1 ? 'Active' : status === 2 ? 'Completed' : 'Rejected'
      const newActivity: ActivityEvent = {
        id: `status-${transactionId}-${Date.now()}`,
        type: 'transaction',
        action: 'Transaction Status Updated',
        description: `Transaction #${transactionId} status changed to ${statusText}`,
        timestamp: new Date(),
        status: status === 2 ? 'success' : status === 3 ? 'rejected' : 'pending'
      }
      setActivities(prev => [newActivity, ...prev.slice(0, 9)])
    }

    const handleApprovalRequested = (approvalId: bigint, transactionId: bigint, requester: string) => {
      const newActivity: ActivityEvent = {
        id: `approval-request-${approvalId}`,
        type: 'approval',
        action: 'Approval Requested',
        description: `Approval requested for transaction #${transactionId} by ${requester.slice(0, 6)}...${requester.slice(-4)}`,
        timestamp: new Date(),
        status: 'pending'
      }
      setActivities(prev => [newActivity, ...prev.slice(0, 9)])
    }

    const handleApprovalProcessed = (approvalId: bigint, status: number, approver: string) => {
      const newActivity: ActivityEvent = {
        id: `approval-processed-${approvalId}`,
        type: 'approval',
        action: 'Approval Processed',
        description: `Approval #${approvalId} ${status === 1 ? 'approved' : 'rejected'} by ${approver.slice(0, 6)}...${approver.slice(-4)}`,
        timestamp: new Date(),
        status: status === 1 ? 'success' : 'rejected'
      }
      setActivities(prev => [newActivity, ...prev.slice(0, 9)])
    }

    const handleUserRegistered = (userId: bigint, walletAddress: string, name: string) => {
      const newActivity: ActivityEvent = {
        id: `user-${userId}`,
        type: 'user',
        action: 'User Registered',
        description: `New user "${name}" registered (${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)})`,
        timestamp: new Date(),
        status: 'success'
      }
      setActivities(prev => [newActivity, ...prev.slice(0, 9)])
    }

    const handleUserRoleUpdated = (userAddress: string, newRole: number) => {
      const roleText = newRole === 0 ? 'Regular' : newRole === 1 ? 'Manager' : 'Admin'
      const newActivity: ActivityEvent = {
        id: `role-${userAddress}-${Date.now()}`,
        type: 'user',
        action: 'Role Updated',
        description: `User ${userAddress.slice(0, 6)}...${userAddress.slice(-4)} role updated to ${roleText}`,
        timestamp: new Date(),
        status: 'success'
      }
      setActivities(prev => [newActivity, ...prev.slice(0, 9)])
    }

    // Set up event listeners using contract service methods
    contractService.onTransactionCreated(handleTransactionCreated)
    contractService.onTransactionStatusUpdated(handleTransactionStatusUpdated)
    contractService.onApprovalRequested(handleApprovalRequested)
    contractService.onApprovalProcessed(handleApprovalProcessed)
    contractService.onUserRegistered(handleUserRegistered)
    contractService.onUserRoleUpdated(handleUserRoleUpdated)

    // Generate some initial mock activities based on current data
    const generateInitialActivities = () => {
      const mockActivities: ActivityEvent[] = []
      
      if (transactionCount.data && Number(transactionCount.data) > 0) {
        mockActivities.push({
          id: 'mock-tx-1',
          type: 'transaction',
          action: 'Transaction Created',
          description: 'Recent transaction activity detected',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          status: 'success'
        })
      }

      if (approvalCount.data && Number(approvalCount.data) > 0) {
        mockActivities.push({
          id: 'mock-approval-1',
          type: 'approval',
          action: 'Approval Processed',
          description: 'Recent approval activity detected',
          timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
          status: 'success'
        })
      }

      if (userCount.data && Number(userCount.data) > 1) {
        mockActivities.push({
          id: 'mock-user-1',
          type: 'user',
          action: 'User Registered',
          description: 'Recent user registration activity',
          timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
          status: 'success'
        })
      }

      setActivities(mockActivities)
      setIsLoading(false)
    }

    generateInitialActivities()

    // Cleanup event listeners
    return () => {
      // contractService.removeAllListeners()
    }
  }, [contract, provider, signer, transactionCount.data, approvalCount.data, userCount.data])

  const getActivityIcon = (type: string, status: string) => {
    switch (type) {
      case 'transaction':
        return status === 'success' ? <CheckCircle className="h-4 w-4 text-green-500" /> :
               status === 'rejected' ? <XCircle className="h-4 w-4 text-red-500" /> :
               <FileText className="h-4 w-4 text-blue-500" />
      case 'approval':
        return status === 'success' ? <CheckCircle className="h-4 w-4 text-green-500" /> :
               status === 'rejected' ? <XCircle className="h-4 w-4 text-red-500" /> :
               <Clock className="h-4 w-4 text-yellow-500" />
      case 'user':
        return <UserPlus className="h-4 w-4 text-purple-500" />
      default:
        return <TrendingUp className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">Success</Badge>
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'rejected':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Rejected</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-4 w-4" />
          <span>Recent Activity</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-muted-foreground">No recent activity</p>
            <p className="text-sm text-muted-foreground">Activity will appear here as you use the platform</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type, activity.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.action}
                    </p>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(activity.status)}
                      <span className="text-xs text-gray-500">
                        {activity.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {activity.description}
                  </p>
                  {activity.amount && (
                    <p className="text-xs text-gray-500 mt-1">
                      Amount: {activity.amount} ETH
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 