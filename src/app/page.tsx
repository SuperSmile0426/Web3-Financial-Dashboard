'use client'

import { useWeb3 } from '@/components/web3-provider'
import { Dashboard } from '@/components/dashboard'
import { Navigation } from '@/components/navigation'
import { AutoRegistration } from '@/components/auto-registration'

export default function HomePage() {
  const { isConnected } = useWeb3()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navigation />
      <main className="container mx-auto px-4 py-12">
        {!isConnected ? (
          <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-12">
            <div className="text-center space-y-6 max-w-3xl">
              <div className="space-y-4">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Web3 Financial Dashboard
                </h1>
                <p className="text-xl text-slate-600 leading-relaxed">
                  Connect your wallet using the button in the header to manage financial transactions, approvals, and users with blockchain integration.
                </p>
              </div>

              <div className="flex items-center justify-center space-x-8 text-sm text-slate-500">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Secure Transactions</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Real-time Updates</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Role-based Access</span>
                </div>
              </div>
            </div>
            
            <div className="text-center space-y-4">
              <div className="text-lg font-medium text-slate-700">
                Click "Connect Wallet" in the header to get started
              </div>
              <div className="text-sm text-slate-500">
                Make sure you have MetaMask installed and are on the Holesky testnet
              </div>
            </div>
          </div>
        ) : (
          <Dashboard />
        )}
      </main>
      {isConnected && <AutoRegistration />}
    </div>
  )
} 