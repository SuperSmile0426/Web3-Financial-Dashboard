'use client'

import { useWeb3 } from '@/components/web3-provider'
import { useContract } from '@/hooks/use-contract'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'
import { Approval, ApprovalStatus } from '@/types/contracts'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

// Process Approval Dialog Component
function ProcessApprovalDialog({ 
  approvalId, 
  approved 
}: { 
  approvalId: bigint
  approved: boolean 
}) {
  const { useProcessApproval } = useContract()
  const processApproval = useProcessApproval()
  const [isOpen, setIsOpen] = useState(false)

  const form = useForm({
    resolver: zodResolver(z.object({
      reason: z.string().min(1, 'Reason is required').max(200, 'Reason too long')
    })),
    defaultValues: {
      reason: ''
    }
  })

  const onSubmit = async (data: { reason: string }) => {
    try {
      await processApproval.mutateAsync({
        approvalId,
        approved,
        reason: data.reason
      })
      form.reset()
      setIsOpen(false)
    } catch (error) {
      console.error('Failed to process approval:', error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant={approved ? "default" : "outline"}>
          {approved ? (
            <CheckCircle className="h-4 w-4 mr-1" />
          ) : (
            <XCircle className="h-4 w-4 mr-1" />
          )}
          {approved ? 'Approve' : 'Reject'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{approved ? 'Approve' : 'Reject'} Request</DialogTitle>
          <DialogDescription>
            {approved ? 'Approve' : 'Reject'} this approval request
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={`Explain why you are ${approved ? 'approving' : 'rejecting'} this request...`}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2">
              <Button 
                type="submit" 
                disabled={processApproval.isPending}
                className="flex-1"
              >
                {processApproval.isPending ? 'Processing...' : (approved ? 'Approve' : 'Reject')}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                disabled={processApproval.isPending}
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

export function ApprovalList() {
  const { usePendingApprovals, useApproval, useCurrentUser, useTransaction } = useContract()
  const { account } = useWeb3()
  
  // Fetch current user to determine their role and permissions
  const currentUser = useCurrentUser()
  
  // Determine if user can see approvals
  const isAdmin = currentUser.data?.role === 2
  const isManager = currentUser.data?.role === 1
  const canViewApprovals = isAdmin || isManager
  
  // Fetch pending approvals
  const pendingApprovals = usePendingApprovals(canViewApprovals)
  
  // Get approval details with transaction information
  const allApprovals = pendingApprovals.data?.map((approval: Approval) => ({
    id: Number(approval.id),
    transactionId: Number(approval.transactionId),
    requester: approval.requester,
    reason: approval.reason,
    status: getStatusText(approval.status),
    statusCode: approval.status,
    timestamp: new Date(Number(approval.timestamp) * 1000).toISOString()
  })) || []
  
  // For regular users, we'll show all pending approvals but add transaction context
  // The contract will handle authorization when they try to process the approval
  const approvals = allApprovals

  function getStatusText(status: number): string {
    switch (status) {
      case 0: return 'Pending'
      case 1: return 'Approved'
      case 2: return 'Rejected'
      default: return 'Unknown'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'Pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'Rejected':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  // Show different content based on user permissions
  if (!canViewApprovals && approvals.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Approvals</h2>
            <p className="text-muted-foreground">
              Review and process approval requests
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Approval Access</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                You don't have permission to view approval requests.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Only Admin, Manager, and transaction senders can view and process approvals.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Approvals</h2>
          <p className="text-muted-foreground">
            {canViewApprovals 
              ? 'Review and process all pending approval requests' 
              : 'Review all pending approvals. You can process approvals for transactions you sent.'
            }
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {canViewApprovals ? 'All Pending Approvals' : 'Pending Approvals'}
          </CardTitle>
          {!canViewApprovals && (
            <p className="text-sm text-muted-foreground">
              Showing all pending approvals. You can only process approvals for transactions you sent.
            </p>
          )}
        </CardHeader>
        <CardContent>
          {(pendingApprovals.isLoading || currentUser.isLoading) ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading approvals...</p>
            </div>
          ) : (pendingApprovals.isError || currentUser.isError) ? (
            <div className="text-center py-8">
              <p className="text-red-500">Failed to load approvals</p>
              {pendingApprovals.error && (
                <p className="text-sm text-red-400 mt-2">
                  Error: {pendingApprovals.error.message}
                </p>
              )}
            </div>
          ) : approvals.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {canViewApprovals ? 'No pending approvals found' : 'No pending approvals available'}
              </p>
            </div>
          ) : (
            <>
              {canViewApprovals && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Admin/Manager View:</strong> Showing all {approvals.length} pending approval requests.
                  </p>
                </div>
              )}
              <div className="space-y-4">
                {approvals.map((approval: any) => {
                  // Create a component to fetch and display transaction details
                  const TransactionApprovalItem = () => {
                    const transaction = useTransaction(BigInt(approval.transactionId))
                    const isSender = transaction.data?.from.toLowerCase() === account?.toLowerCase()
                    const canProcess = canViewApprovals || isSender
                    
                    return (
                      <div
                        key={approval.id}
                        className={`flex items-center justify-between p-4 border rounded-lg ${
                          canProcess ? 'bg-blue-50/50 border-blue-200' : 'bg-gray-50/50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          {getStatusIcon(approval.status)}
                          <div>
                            <p className="font-medium">{approval.reason}</p>
                            <p className="text-sm text-muted-foreground">
                              Requested by {approval.requester}
                            </p>
                            {transaction.data && (
                              <p className="text-sm text-muted-foreground">
                                Transaction #{approval.transactionId}: {transaction.data.description} 
                                ({transaction.data.from.slice(0, 6)}...{transaction.data.from.slice(-4)} → {transaction.data.to.slice(0, 6)}...{transaction.data.to.slice(-4)})
                              </p>
                            )}
                            {!canProcess && (
                              <p className="text-sm text-orange-600 mt-1">
                                ⚠️ You cannot process this approval (not the transaction sender)
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {approval.statusCode === ApprovalStatus.Pending && canProcess && (
                            <>
                              <ProcessApprovalDialog approvalId={BigInt(approval.id)} approved={true} />
                              <ProcessApprovalDialog approvalId={BigInt(approval.id)} approved={false} />
                            </>
                          )}
                          {approval.statusCode === ApprovalStatus.Pending && !canProcess && (
                            <span className="text-xs text-muted-foreground px-2 py-1 bg-gray-100 rounded">
                              No Action Available
                            </span>
                          )}
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              {new Date(approval.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  
                  return <TransactionApprovalItem key={approval.id} />
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 