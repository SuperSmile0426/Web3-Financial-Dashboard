'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Web3Provider } from '@/components/web3-provider'
import { Toaster } from 'sonner'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <Web3Provider>
        {children}
        <Toaster />
      </Web3Provider>
    </QueryClientProvider>
  )
} 