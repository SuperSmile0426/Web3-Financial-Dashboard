'use client'

import { useWeb3 } from './web3-provider'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { RefreshCw, AlertCircle, CheckCircle } from 'lucide-react'

export function Web3Debug() {
  const { 
    account, 
    provider, 
    signer, 
    contract, 
    connectWallet, 
    disconnectWallet, 
    refreshContract,
    isConnected, 
    isLoading, 
    error 
  } = useWeb3()

  const handleRefreshContract = async () => {
    try {
      await refreshContract()
    } catch (error) {
      console.error('Failed to refresh contract:', error)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔧 Web3 Connection Debug
          {isConnected ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-500" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <span className="font-medium">Connection Status:</span>
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </div>

        {/* Account */}
        <div className="flex items-center justify-between">
          <span className="font-medium">Account:</span>
          <span className="text-sm font-mono">
            {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "Not connected"}
          </span>
        </div>

        {/* Provider */}
        <div className="flex items-center justify-between">
          <span className="font-medium">Provider:</span>
          <Badge variant={provider ? "secondary" : "outline"}>
            {provider ? "Available" : "Not available"}
          </Badge>
        </div>

        {/* Signer */}
        <div className="flex items-center justify-between">
          <span className="font-medium">Signer:</span>
          <Badge variant={signer ? "secondary" : "outline"}>
            {signer ? "Available" : "Not available"}
          </Badge>
        </div>

        {/* Contract */}
        <div className="flex items-center justify-between">
          <span className="font-medium">Contract:</span>
          <Badge variant={contract ? "secondary" : "outline"}>
            {contract ? "Available" : "Not available"}
          </Badge>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-between">
            <span className="font-medium">Loading:</span>
            <Badge variant="outline">Connecting...</Badge>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Error:</span>
            </div>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {!isConnected ? (
            <Button onClick={connectWallet} disabled={isLoading} className="flex-1">
              {isLoading ? "Connecting..." : "Connect Wallet"}
            </Button>
          ) : (
            <>
              <Button onClick={handleRefreshContract} variant="outline" className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Contract
              </Button>
              <Button onClick={disconnectWallet} variant="destructive" className="flex-1">
                Disconnect
              </Button>
            </>
          )}
        </div>

        {/* Contract Address */}
        <div className="text-xs text-muted-foreground pt-2 border-t">
          <div className="font-medium">Contract Address:</div>
          <div className="font-mono break-all">
            {process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 'Not configured'}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 