'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useContract } from '@/hooks/use-contract'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { ethers } from 'ethers'

const transactionSchema = z.object({
  to: z.string().min(42, 'Invalid Ethereum address').max(42, 'Invalid Ethereum address'),
  amount: z.string().min(1, 'Amount is required'),
  description: z.string().min(1, 'Description is required').max(200, 'Description too long')
})

type TransactionFormData = z.infer<typeof transactionSchema>

export function NewTransactionForm() {
  const { useCreateTransaction } = useContract()
  const createTransaction = useCreateTransaction()
  const [isOpen, setIsOpen] = useState(false)

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      to: '',
      amount: '',
      description: ''
    }
  })

  const onSubmit = async (data: TransactionFormData) => {
    try {
      // Convert amount to wei (assuming ETH, adjust for your token)
      const amountInWei = ethers.parseEther(data.amount)
      
      await createTransaction.mutateAsync({
        to: data.to,
        amount: amountInWei,
        description: data.description
      })
      
      form.reset()
      setIsOpen(false)
    } catch (error) {
      console.error('Failed to create transaction:', error)
    }
  }

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} className="w-full">
        Create New Transaction
      </Button>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Transaction</CardTitle>
        <CardDescription>
          Create a new financial transaction that will require approval
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient Address</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="0x..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (ETH)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.000001"
                      placeholder="0.001" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Transaction purpose..." 
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
                disabled={createTransaction.isPending}
                className="flex-1"
              >
                {createTransaction.isPending ? 'Creating...' : 'Create Transaction'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                disabled={createTransaction.isPending}
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