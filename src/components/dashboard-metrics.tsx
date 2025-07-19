'use client'

import { useWeb3 } from '@/components/web3-provider'
import { useContract } from '@/hooks/use-contract'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, CheckCircle, Users, DollarSign } from 'lucide-react'
import { formatNumber } from '@/lib/utils'

export function DashboardMetrics() {
  const { useTransactionCount, useApprovalCount, useUserCount, usePendingApprovals, useCurrentUser } = useContract()
  
  // Fetch current user to determine permissions
  const currentUser = useCurrentUser()
  const isAdmin = currentUser.data?.role === 2
  const isManager = currentUser.data?.role === 1
  const canViewApprovals = isAdmin || isManager
  
  // Fetch real data from smart contracts
  const transactionCount = useTransactionCount()
  const approvalCount = useApprovalCount()
  const userCount = useUserCount()
  const pendingApprovals = usePendingApprovals(canViewApprovals)

  // Calculate metrics from real data
  const metrics = {
    totalTransactions: Number(transactionCount.data || 0),
    pendingApprovals: canViewApprovals ? (pendingApprovals.data?.length || 0) : 0,
    activeUsers: Number(userCount.data || 0),
    totalVolume: 0 // This would need to be calculated from transaction amounts
  }

  const isLoading = transactionCount.isLoading || approvalCount.isLoading || userCount.isLoading || (canViewApprovals && pendingApprovals.isLoading) || currentUser.isLoading

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">...</div>
              <p className="text-xs text-muted-foreground">Loading data</p>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(metrics.totalTransactions)}</div>
          <p className="text-xs text-muted-foreground">
            From blockchain
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(metrics.pendingApprovals)}</div>
          <p className="text-xs text-muted-foreground">
            Awaiting review
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(metrics.activeUsers)}</div>
          <p className="text-xs text-muted-foreground">
            Registered users
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Approvals</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(Number(approvalCount.data || 0))}</div>
          <p className="text-xs text-muted-foreground">
            All time approvals
          </p>
        </CardContent>
      </Card>
    </div>
  )
} 