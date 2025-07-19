'use client'

import { useWeb3 } from '@/components/web3-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Wallet, Loader2, Network, CheckCircle, AlertCircle } from 'lucide-react'

export function WalletConnect() {
  const { connectWallet, isLoading, error } = useWeb3()

  const getStatusIcon = () => {
    if (isLoading) {
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
    }
    if (error) {
      return <AlertCircle className="h-4 w-4 text-red-500" />
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />
  }

  return (
    <div className="space-y-6">
      <Button 
        onClick={connectWallet} 
        disabled={isLoading}
        size="lg"
        className="px-8 h-12 text-base font-medium"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Wallet className="mr-2 h-5 w-5" />
            Connect Wallet
          </>
        )}
      </Button>
      
      <Card className="border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Network className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <h3 className="font-semibold text-blue-900">Network Configuration</h3>
              <p className="text-sm text-blue-700 leading-relaxed">
                This application requires the Holesky testnet. MetaMask will automatically configure the network for optimal performance.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="flex items-center space-x-2 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
          {getStatusIcon()}
          <span className="text-red-700 font-medium">
            {error.includes('MetaMask is not installed') 
              ? 'Please install MetaMask to continue'
              : error.includes('User rejected')
              ? 'Connection was cancelled. Please try again.'
              : error.includes('network')
              ? 'Network configuration issue. Please try again.'
              : error
            }
          </span>
        </div>
      )}
      
      {!error && !isLoading && (
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-muted-foreground bg-gray-50 rounded-full px-4 py-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Ready to connect</span>
          </div>
        </div>
      )}
    </div>
  )
} 