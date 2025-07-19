'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { ethers } from 'ethers'
import FinancialPlatformArtifact from '../../contract-technical-assignment/artifacts/contracts/FinancialPlatform.sol/FinancialPlatform.json'

interface Web3ContextType {
  account: string | null
  provider: ethers.BrowserProvider | null
  signer: ethers.JsonRpcSigner | null
  contract: ethers.Contract | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  refreshContract: () => Promise<void>
  isConnected: boolean
  isLoading: boolean
  error: string | null
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

export function Web3Provider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isManuallyDisconnected, setIsManuallyDisconnected] = useState(false)

  // Contract address - supports both localhost and Holesky
  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x11B8A04622aa68603f82B219625e64E792700378'
  
  // Use the same ABI as the contract service
  const CONTRACT_ABI = FinancialPlatformArtifact.abi

  // Enhanced network configuration with complete Holesky details
  const NETWORK_CONFIG: Record<string, any> = {
    localhost: {
      chainId: '0x7A69', // 31337
      chainName: 'Hardhat Localhost',
      nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18
      },
      rpcUrls: ['http://localhost:8545'],
      blockExplorerUrls: []
    },
    holesky: {
      chainId: '0x4268', // 17000
      chainName: 'Holesky Testnet',
      nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18
      },
      rpcUrls: [
        'https://ethereum-holesky.publicnode.com',
        'https://holesky.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
        'https://rpc-holesky.rockx.com'
      ],
      blockExplorerUrls: ['https://holesky.etherscan.io']
    }
  }

  // Check localStorage for manual disconnect state on mount
  useEffect(() => {
    const disconnectedState = localStorage.getItem('wallet_disconnected')
    if (disconnectedState === 'true') {
      setIsManuallyDisconnected(true)
    }
  }, [])

  const addNetworkToMetaMask = async (networkName: string) => {
    const networkConfig = NETWORK_CONFIG[networkName]
    if (!networkConfig) {
      throw new Error(`Network configuration not found for ${networkName}`)
    }

    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [networkConfig],
      })
      console.log(`${networkName} network added successfully`)
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error('User rejected adding the network')
      } else if (error.code === -32602) {
        throw new Error('Network already exists in MetaMask')
      } else {
        throw new Error(`Failed to add network: ${error.message}`)
      }
    }
  }

  const switchToNetwork = async (networkName: string) => {
    const networkConfig = NETWORK_CONFIG[networkName]
    if (!networkConfig) {
      throw new Error(`Network configuration not found for ${networkName}`)
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: networkConfig.chainId }],
      })
      console.log(`Switched to ${networkName} network`)
    } catch (error: any) {
      if (error.code === 4902) {
        // Network doesn't exist, add it first
        console.log(`${networkName} network not found, adding it...`)
        await addNetworkToMetaMask(networkName)
        // Try switching again after adding
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: networkConfig.chainId }],
        })
      } else if (error.code === 4001) {
        throw new Error('User rejected switching to the network')
      } else {
        throw new Error(`Failed to switch network: ${error.message}`)
      }
    }
  }

  const connectWallet = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed. Please install MetaMask to use this application.')
      }

      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.send('eth_requestAccounts', [])
      
      if (accounts.length === 0) {
        throw new Error('No accounts found. Please connect your wallet.')
      }

      // Get the target network from environment or default to holesky
      const targetNetwork = process.env.NEXT_PUBLIC_NETWORK_NAME || 'holesky'
      const targetChainId = NETWORK_CONFIG[targetNetwork]?.chainId

      if (!targetChainId) {
        throw new Error(`Unsupported network: ${targetNetwork}`)
      }

      // Check current network and switch if needed
      const network = await provider.getNetwork()
      const currentChainId = '0x' + network.chainId.toString(16)
      
      if (currentChainId !== targetChainId) {
        try {
          await switchToNetwork(targetNetwork)
        } catch (networkError: any) {
          console.error('Network switching error:', networkError)
          throw new Error(`Failed to switch to ${targetNetwork}: ${networkError.message}`)
        }
      }

      // Get updated provider and signer after network switch
      const updatedProvider = new ethers.BrowserProvider(window.ethereum)
      const signer = await updatedProvider.getSigner()
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)

      setAccount(accounts[0])
      setProvider(updatedProvider)
      setSigner(signer)
      setContract(contract)
      
      // Clear manual disconnect state since user is connecting
      setIsManuallyDisconnected(false)
      localStorage.removeItem('wallet_disconnected')

      console.log('Wallet connected successfully:', accounts[0])

    } catch (err) {
      console.error('Wallet connection error:', err)
      setError(err instanceof Error ? err.message : 'Failed to connect wallet')
    } finally {
      setIsLoading(false)
    }
  }

  const disconnectWallet = async () => {
    try {
      // Try multiple methods to disconnect from MetaMask
      if (window.ethereum) {
        try {
          // Method 1: Try to revoke permissions (may not work in all MetaMask versions)
          await window.ethereum.request({
            method: 'wallet_revokePermissions',
            params: [{ eth_accounts: {} }]
          })
          console.log('MetaMask permissions revoked successfully')
        } catch (error: any) {
          console.log('MetaMask revoke permissions not supported or failed:', error.message)
          
          // Method 2: Try to request permissions again to trigger disconnect
          try {
            await window.ethereum.request({
              method: 'wallet_requestPermissions',
              params: [{ eth_accounts: {} }]
            })
            console.log('MetaMask permissions re-requested')
          } catch (error2: any) {
            console.log('MetaMask permission request failed:', error2.message)
          }
        }
      }
    } catch (error) {
      console.log('Error during MetaMask disconnect:', error)
    }

    // Clear local state
    setAccount(null)
    setProvider(null)
    setSigner(null)
    setContract(null)
    setError(null)
    setIsManuallyDisconnected(true)
    
    // Store disconnect state in localStorage
    localStorage.setItem('wallet_disconnected', 'true')
    
    console.log('Wallet disconnected successfully')
  }

  const refreshContract = async () => {
    if (!signer) {
      throw new Error('No signer available to refresh contract.')
    }
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
    setContract(contract)
    console.log('Contract refreshed successfully.')
  }

  // Auto-connect if previously connected and not manually disconnected
  useEffect(() => {
    if (window.ethereum && window.ethereum.selectedAddress && !isManuallyDisconnected) {
      connectWallet()
    }

    // Set up event listeners for account and chain changes
    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected from MetaMask
        disconnectWallet()
      } else {
        const newAccount = accounts[0]
        setAccount(newAccount)
        
        // Update provider, signer, and contract with new account
        try {
          const updatedProvider = new ethers.BrowserProvider(window.ethereum)
          const newSigner = await updatedProvider.getSigner()
          const newContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, newSigner)
          
          setProvider(updatedProvider)
          setSigner(newSigner)
          setContract(newContract)
          
          // Clear manual disconnect state since user is connecting
          setIsManuallyDisconnected(false)
          localStorage.removeItem('wallet_disconnected')
          
          console.log('Account changed, contract updated with new signer:', newAccount)
        } catch (error) {
          console.error('Failed to update contract with new account:', error)
          setError('Failed to update contract connection with new account')
        }
      }
    }

    const handleChainChanged = (chainId: string) => {
      // Check if the new chain is our target network
      const targetChainId = NETWORK_CONFIG[process.env.NEXT_PUBLIC_NETWORK_NAME || 'holesky']?.chainId
      if (chainId !== targetChainId) {
        setError(`Please switch to the ${process.env.NEXT_PUBLIC_NETWORK_NAME || 'holesky'} network`)
      } else {
        setError(null)
        // Reload the page to update the contract instance
        window.location.reload()
      }
    }

    // Add event listeners
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)
    }

    // Cleanup function
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [isManuallyDisconnected])

  const value: Web3ContextType = {
    account,
    provider,
    signer,
    contract,
    connectWallet,
    disconnectWallet,
    refreshContract,
    isConnected: !!account,
    isLoading,
    error,
  }

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  )
}

export function useWeb3() {
  const context = useContext(Web3Context)
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider')
  }
  return context
} 