'use client'

import { useState } from 'react'
import { useWeb3 } from '@/components/web3-provider'
import { useContract } from '@/hooks/use-contract'
import { TransactionStatus, Transaction } from '@/types/contracts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, Clock, XCircle, FileText, Plus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { NewTransactionForm } from './new-transaction-form'
import { formatEthAmount } from '@/lib/utils'

const requestApprovalSchema = z.object({
  reason: z.string().min(1, 'Reason is required')
})

function RequestApprovalDialog({ transactionId }: { transactionId: bigint }) {
  const [isOpen, setIsOpen] = useState(false)
  const { useRequestApproval } = useContract()
  const requestApproval = useRequestApproval()
  
  const form = useForm<z.infer<typeof requestApprovalSchema>>({
    resolver: zodResolver(requestApprovalSchema)
  })

  const testContract = async () => {
    try {
      const { contract } = useWeb3()
      if (contract) {
        // Check if requestApproval function exists
        const functions = contract.interface.fragments
        const hasRequestApproval = functions.some(f => 'name' in f && f.name === 'requestApproval')
        
        if (!hasRequestApproval) {
          toast.error('requestApproval function not found in contract ABI')
          return
        }
        
        // Try to call requestApproval directly
        try {
          const tx = await contract.requestApproval(BigInt(1), "Test reason")
          toast.success('Contract test successful! Check console for details.')
        } catch (error) {
          console.error('Direct requestApproval call failed:', error)
          toast.error(`Contract test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }
    } catch (error) {
      console.error('Contract test failed:', error)
      toast.error('Contract test failed')
    }
  }

  const onSubmit = async (data: { reason: string }) => {
    try {
      await requestApproval.mutateAsync({ transactionId, reason: data.reason })
      toast.success('Approval requested successfully')
      setIsOpen(false)
      form.reset()
    } catch (error) {
      console.error('Request approval error:', error)
      toast.error(`Failed to request approval: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Request Approval
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Approval</DialogTitle>
          <DialogDescription>
            Request approval for this transaction
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Approval</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Explain why this transaction needs approval..." 
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
                disabled={requestApproval.isPending}
                className="flex-1"
              >
                {requestApproval.isPending ? 'Requesting...' : 'Request Approval'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                disabled={requestApproval.isPending}
              >
                Cancel
              </Button>
            </div>
            <Button 
              type="button" 
              variant="secondary" 
              onClick={testContract}
              size="sm"
            >
              Test Contract
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export function TransactionList() {
  const { useCurrentUserTransactions, useRequestApproval, useCompleteTransaction, useCurrentUser } = useContract()
  const { account, contract } = useWeb3()
  
  // Fetch user's transactions and current user info
  const userTransactions = useCurrentUserTransactions()
  const currentUser = useCurrentUser()
  const requestApproval = useRequestApproval()
  const completeTransaction = useCompleteTransaction()
  
  // Determine user permissions
  const isAdmin = currentUser.data?.role === 2
  const isManager = currentUser.data?.role === 1
  const canRequestApproval = isAdmin || isManager
  
  // Get transaction details for each transaction ID
  const transactions = userTransactions.data?.map((tx: Transaction) => ({
    id: Number(tx.id),
    from: tx.from,
    to: tx.to,
    amount: Number(tx.amount) / 1e18, // Convert from wei to ETH
    description: tx.description,
    status: getStatusText(tx.status),
    statusCode: tx.status,
    approvalId: Number(tx.approvalId),
    timestamp: new Date(Number(tx.timestamp) * 1000).toISOString()
  })) || []

  function getStatusText(status: number): string {
    switch (status) {
      case 0: return 'Pending'
      case 1: return 'Active'
      case 2: return 'Completed'
      case 3: return 'Rejected'
      default: return 'Unknown'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'Pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'Rejected':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'Active':
        return <FileText className="h-4 w-4 text-blue-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  // Check if current user can request approval for a specific transaction
  const canRequestApprovalForTransaction = (transaction: any) => {
    if (canRequestApproval) return true // Admin/Manager can request approval for any transaction
    if (!account) return false
    return transaction.to.toLowerCase() === account.toLowerCase() // Only receiver can request approval
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Transactions</h2>
          <p className="text-muted-foreground">
            View and manage all financial transactions
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Transaction
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Transaction</DialogTitle>
              <DialogDescription>
                Create a new financial transaction that will require approval
              </DialogDescription>
            </DialogHeader>
            <NewTransactionForm />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {userTransactions.isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading transactions...</p>
            </div>
          ) : userTransactions.isError ? (
            <div className="text-center py-8">
              <p className="text-red-500">Failed to load transactions</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No transactions found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx: any) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  {getStatusIcon(tx.status)}
                  <div>
                    <p className="font-medium">{tx.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {tx.from} → {tx.to}
                    </p>
                    {account && (
                      <div className="flex items-center space-x-2 mt-1">
                        {tx.from.toLowerCase() === account.toLowerCase() && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                            You are Sender
                          </span>
                        )}
                        {tx.to.toLowerCase() === account.toLowerCase() && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                            You are Receiver
                          </span>
                        )}
                        {canRequestApproval && (
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                            Admin/Manager
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-medium">{formatEthAmount(tx.amount)}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(tx.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      tx.status === 'Completed' 
                        ? 'bg-green-100 text-green-800' 
                        : tx.status === 'Active'
                        ? 'bg-blue-100 text-blue-800'
                        : tx.status === 'Rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {tx.status}
                    </span>
                    <div className="flex space-x-2">
                      {tx.statusCode === TransactionStatus.Pending && tx.approvalId === 0 && canRequestApprovalForTransaction(tx) && (
                        <RequestApprovalDialog transactionId={BigInt(tx.id)} />
                      )}
                      {tx.statusCode === TransactionStatus.Pending && tx.approvalId === 0 && !canRequestApprovalForTransaction(tx) && (
                        <span className="text-xs text-muted-foreground px-2 py-1 bg-gray-100 rounded">
                          Waiting for Receiver
                        </span>
                      )}
                      {tx.statusCode === TransactionStatus.Pending && tx.approvalId !== 0 && (
                        <span className="text-xs text-muted-foreground px-2 py-1 bg-gray-100 rounded">
                          Approval Requested
                        </span>
                      )}
                      {tx.statusCode === TransactionStatus.Active && (
                        <Button
                          size="sm"
                          onClick={() => completeTransaction.mutate(BigInt(tx.id))}
                          disabled={completeTransaction.isPending}
                        >
                          {completeTransaction.isPending ? 'Completing...' : 'Complete'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </CardContent>
      </Card>
    </div>
  )
} 