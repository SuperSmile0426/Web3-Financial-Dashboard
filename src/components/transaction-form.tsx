'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useContract } from '@/hooks/use-contract'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Loader2 } from 'lucide-react'

const transactionSchema = z.object({
  to: z.string().min(42, 'Invalid Ethereum address').max(42, 'Invalid Ethereum address'),
  amount: z.string().min(1, 'Amount is required').refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Amount must be a positive number'
  }),
  description: z.string().min(1, 'Description is required').max(200, 'Description too long')
})

type TransactionFormData = z.infer<typeof transactionSchema>

export function TransactionForm() {
  const [isOpen, setIsOpen] = useState(false)
  const { useCreateTransaction } = useContract()
  const createTransaction = useCreateTransaction()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema)
  })

  const onSubmit = async (data: TransactionFormData) => {
    try {
      await createTransaction.mutateAsync({
        to: data.to,
        amount: BigInt(Math.floor(Number(data.amount) * 1e18)), // Convert to wei
        description: data.description
      })
      reset()
      setIsOpen(false)
    } catch (error) {
      console.error('Failed to create transaction:', error)
    }
  }

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        New Transaction
      </Button>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create New Transaction</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Recipient Address
            </label>
            <input
              {...register('to')}
              type="text"
              placeholder="0x..."
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.to && (
              <p className="text-sm text-red-500 mt-1">{errors.to.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Amount (ETH)
            </label>
            <input
              {...register('amount')}
              type="number"
              step="0.001"
              placeholder="0.001"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.amount && (
              <p className="text-sm text-red-500 mt-1">{errors.amount.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              placeholder="Transaction description..."
              rows={3}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.description && (
              <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="flex space-x-2">
            <Button
              type="submit"
              disabled={createTransaction.isPending}
              className="flex-1"
            >
              {createTransaction.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Transaction'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsOpen(false)
                reset()
              }}
            >
              Cancel
            </Button>
          </div>

          {createTransaction.isError && (
            <p className="text-sm text-red-500">
              Failed to create transaction. Please try again.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  )
} 