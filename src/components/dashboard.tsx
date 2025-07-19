'use client'

import { useState } from 'react'
import { useWeb3 } from '@/components/web3-provider'
import { useContract } from '@/hooks/use-contract'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TransactionList } from '@/components/transaction-list'
import { ApprovalList } from '@/components/approval-list'
import { UserManagement } from '@/components/user-management'
import { DashboardMetrics } from '@/components/dashboard-metrics'
import { RecentActivity } from '@/components/recent-activity'
import { DataCharts } from '@/components/data-charts'
import { 
  BarChart3, 
  Users, 
  FileText, 
  CheckCircle,
  TrendingUp,
  DollarSign
} from 'lucide-react'

export function Dashboard() {
  const { account } = useWeb3()
  const { useCurrentUser } = useContract()
  const currentUser = useCurrentUser()
  const [activeTab, setActiveTab] = useState('overview')

  // Determine user permissions
  const isAdmin = currentUser.data?.role === 2
  const isManager = currentUser.data?.role === 1
  const canViewApprovals = isAdmin || isManager

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Manage your financial transactions and approvals.
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          Connected: {account?.slice(0, 6)}...{account?.slice(-4)}
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Transactions</span>
          </TabsTrigger>
          <TabsTrigger value="approvals" className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span>Approvals</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Users</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <DashboardMetrics />
          
          <div className="grid gap-8 md:grid-cols-2">
            <RecentActivity />
          </div>

          <DataCharts />
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <TransactionList />
        </TabsContent>

        <TabsContent value="approvals" className="space-y-6">
          <ApprovalList />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UserManagement />
        </TabsContent>
      </Tabs>
    </div>
  )
} 