'use client'

import { useWeb3 } from '@/components/web3-provider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Wallet, LogOut, Network, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

export function Navigation() {
  const { account, isConnected, disconnectWallet, provider, connectWallet, isLoading, error } = useWeb3()
  const [networkInfo, setNetworkInfo] = useState<{ name: string; chainId: string } | null>(null)
  const [isCorrectNetwork, setIsCorrectNetwork] = useState<boolean | null>(null)

  useEffect(() => {
    const getNetworkInfo = async () => {
      if (provider) {
        try {
          const network = await provider.getNetwork()
          const networkName = network.name || `Chain ${network.chainId}`
          setNetworkInfo({ name: networkName, chainId: network.chainId.toString() })
          
          // Check if it's the correct network (Holesky testnet)
          const targetChainId = process.env.NEXT_PUBLIC_NETWORK_NAME === 'holesky' ? '17000' : '31337'
          setIsCorrectNetwork(network.chainId.toString() === targetChainId)
        } catch (error) {
          console.error('Failed to get network info:', error)
        }
      }
    }

    getNetworkInfo()
  }, [provider])

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getNetworkBadgeVariant = () => {
    if (isCorrectNetwork === null) return 'secondary'
    return isCorrectNetwork ? 'default' : 'destructive'
  }

  const getNetworkIcon = () => {
    if (isCorrectNetwork === null) return <Network className="h-3 w-3" />
    return isCorrectNetwork ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />
  }

  return (
    <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Financial Dashboard
            </h1>
            {isConnected && networkInfo && (
              <Badge variant={getNetworkBadgeVariant()} className="flex items-center space-x-1 text-xs">
                {getNetworkIcon()}
                <span>{networkInfo.name}</span>
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            {isConnected && account ? (
              <>
                <div className="flex items-center space-x-2 text-sm text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
                  <Wallet className="h-4 w-4 text-slate-500" />
                  <span className="font-medium">{formatAddress(account)}</span>
                </div>
                {!isCorrectNetwork && isCorrectNetwork !== null && (
                  <Badge variant="destructive" className="text-xs">
                    Wrong Network
                  </Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={disconnectWallet}
                  className="border-slate-200 hover:bg-slate-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Disconnect
                </Button>
              </>
            ) : (
              <Button 
                onClick={connectWallet} 
                disabled={isLoading}
                size="sm"
                className="px-4 h-9 text-sm font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect Wallet
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 