'use client'

import { useContract } from '@/hooks/use-contract'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw, Database } from 'lucide-react'

export function DataDebug() {
  const { 
    useTransactionCount, 
    useApprovalCount, 
    useUserCount, 
    usePendingApprovals, 
    useCurrentUser, 
    useRecentTransactions,
    useAllTransactions,
    useAllUsers
  } = useContract()
  
  // Fetch data for debugging
  const transactionCount = useTransactionCount()
  const approvalCount = useApprovalCount()
  const userCount = useUserCount()
  const pendingApprovals = usePendingApprovals()
  const currentUser = useCurrentUser()
  const recentTransactions = useRecentTransactions(BigInt(10))
  const allTransactions = useAllTransactions()
  const allUsers = useAllUsers(currentUser.data?.role === 2)

  const refreshAll = () => {
    transactionCount.refetch()
    approvalCount.refetch()
    userCount.refetch()
    pendingApprovals.refetch()
    currentUser.refetch()
    recentTransactions.refetch()
    allTransactions.refetch()
    allUsers.refetch()
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-orange-800">
          <Database className="h-4 w-4" />
          <span>Data Debug Panel</span>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={refreshAll}
            className="ml-auto"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh All
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-orange-800 mb-2">Counts</h4>
            <div className="space-y-1">
              <div>Transactions: {transactionCount.data?.toString() || 'Loading...'}</div>
              <div>Approvals: {approvalCount.data?.toString() || 'Loading...'}</div>
              <div>Users: {userCount.data?.toString() || 'Loading...'}</div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-orange-800 mb-2">Data Arrays</h4>
            <div className="space-y-1">
              <div>Recent Transactions: {recentTransactions.data?.length || 0}</div>
              <div>All Transactions: {allTransactions.data?.length || 0}</div>
              <div>Pending Approvals: {pendingApprovals.data?.length || 0}</div>
              <div>All Users: {allUsers.data?.length || 0}</div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-orange-800 mb-2">Sample Transaction Data</h4>
          {recentTransactions.data && recentTransactions.data.length > 0 ? (
            <div className="bg-white p-2 rounded text-xs">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(recentTransactions.data[0], null, 2)}
              </pre>
            </div>
          ) : (
            <div className="text-orange-600">No transaction data available</div>
          )}
        </div>

        <div>
          <h4 className="font-medium text-orange-800 mb-2">Sample Approval Data</h4>
          {pendingApprovals.data && pendingApprovals.data.length > 0 ? (
            <div className="bg-white p-2 rounded text-xs">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(pendingApprovals.data[0], null, 2)}
              </pre>
            </div>
          ) : (
            <div className="text-orange-600">No approval data available</div>
          )}
        </div>

        <div>
          <h4 className="font-medium text-orange-800 mb-2">Current User</h4>
          <div className="bg-white p-2 rounded text-xs">
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(currentUser.data, null, 2)}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 