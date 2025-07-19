import { ethers } from 'ethers'
import { 
  Transaction, 
  Approval, 
  User, 
  TransactionStatus, 
  ApprovalStatus, 
  UserRole 
} from '@/types/contracts'
import FinancialPlatformArtifact from '../../contract-technical-assignment/artifacts/contracts/FinancialPlatform.sol/FinancialPlatform.json';

// Utility functions to convert bigint to number
const convertBigIntToNumber = (value: bigint): number => {
  return Number(value)
}

const convertBigIntToNumberSafe = (value: bigint): number => {
  try {
    return Number(value)
  } catch {
    return 0
  }
}

// Contract ABI - updated to match the actual deployed contract
const CONTRACT_ABI = FinancialPlatformArtifact.abi;

export class ContractService {
  private contract: ethers.Contract
  private provider: ethers.BrowserProvider

  constructor(contractAddress: string, provider: ethers.BrowserProvider, signer: ethers.JsonRpcSigner, existingContract?: ethers.Contract) {
    this.provider = provider
    
    if (existingContract) {
      this.contract = existingContract
    } else {
      this.contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer)
    }
  }

  // Helper method to check if function exists
  private checkFunction(name: string): boolean {
    return typeof this.contract[name] === 'function'
  }

  // User Management
  async getUser(userAddress: string): Promise<User | null> {
    try {
      if (!this.checkFunction('getUser')) {
        throw new Error('getUser function not available in contract ABI')
      }
      
      const user = await this.contract.getUser(userAddress)
      
      // Check if user is actually registered (ID should be > 0 for registered users)
      if (user.id === BigInt(0)) {
        return null // User not registered
      }
      
      return {
        id: convertBigIntToNumber(user.id),
        walletAddress: user.walletAddress,
        name: user.name,
        email: user.email,
        role: convertBigIntToNumberSafe(user.role),
        isActive: user.isActive,
        createdAt: convertBigIntToNumber(user.createdAt)
      }
    } catch (error) {
      console.error('getUser error:', error)
      throw new Error(`Failed to get user: ${error}`)
    }
  }

  async getAllUsers(): Promise<string[]> {
    try {
      if (!this.checkFunction('getAllUsers')) {
        throw new Error('getAllUsers function not available in contract ABI')
      }
      
      return await this.contract.getAllUsers()
    } catch (error) {
      console.error('getAllUsers error:', error)
      throw new Error(`Failed to get all users: ${error}`)
    }
  }

  async registerUser(walletAddress: string, name: string, email: string, role: UserRole): Promise<void> {
    try {
      if (!this.checkFunction('registerUser')) {
        throw new Error('registerUser function not available in contract ABI')
      }
      
      const tx = await this.contract.registerUser(walletAddress, name, email, role)
      await tx.wait()
    } catch (error) {
      console.error('registerUser error:', error)
      throw new Error(`Failed to register user: ${error}`)
    }
  }

  async updateUserRole(userAddress: string, newRole: UserRole): Promise<void> {
    try {
      if (!this.checkFunction('updateUserRole')) {
        throw new Error('updateUserRole function not available in contract ABI')
      }
      
      const tx = await this.contract.updateUserRole(userAddress, newRole)
      await tx.wait()
    } catch (error) {
      console.error('updateUserRole error:', error)
      throw new Error(`Failed to update user role: ${error}`)
    }
  }

  // Transaction Management
  async createTransaction(to: string, amount: bigint, description: string): Promise<void> {
    try {
      if (!this.checkFunction('createTransaction')) {
        throw new Error('createTransaction function not available in contract ABI')
      }
      
      const tx = await this.contract.createTransaction(to, amount, description)
      await tx.wait()
    } catch (error) {
      console.error('createTransaction error:', error)
      throw new Error(`Failed to create transaction: ${error}`)
    }
  }

  async getTransaction(id: bigint): Promise<Transaction> {
    try {
      if (!this.checkFunction('getTransaction')) {
        throw new Error('getTransaction function not available in contract ABI')
      }
      
      const tx = await this.contract.getTransaction(id)
      return {
        id: convertBigIntToNumber(tx.id),
        from: tx.from,
        to: tx.to,
        amount: tx.amount,
        description: tx.description,
        status: convertBigIntToNumberSafe(tx.status),
        timestamp: convertBigIntToNumber(tx.timestamp),
        approvalId: convertBigIntToNumber(tx.approvalId)
      }
    } catch (error) {
      console.error('getTransaction error:', error)
      throw new Error(`Failed to get transaction: ${error}`)
    }
  }

  async getUserTransactions(userAddress: string): Promise<bigint[]> {
    try {
      if (!this.checkFunction('getUserTransactions')) {
        throw new Error('getUserTransactions function not available in contract ABI')
      }
      
      // First check the total transaction count
      const totalTransactions = await this.getTransactionCount()
      
      // If no transactions exist, return empty array
      if (totalTransactions === BigInt(0)) {
        return []
      }
      
      return await this.contract.getUserTransactions(userAddress)
    } catch (error) {
      console.error('getUserTransactions error:', error)
      throw new Error(`Failed to get user transactions: ${error}`)
    }
  }

  async getRecentTransactions(count: bigint): Promise<bigint[]> {
    try {
      if (!this.checkFunction('getRecentTransactions')) {
        throw new Error('getRecentTransactions function not available in contract ABI')
      }
      
      // First check the total transaction count
      const totalTransactions = await this.getTransactionCount()
      
      // If no transactions exist, return empty array
      if (totalTransactions === BigInt(0)) {
        return []
      }
      
      // If requested count is greater than total transactions, use total transactions
      const actualCount = count > totalTransactions ? totalTransactions : count
      
      return await this.contract.getRecentTransactions(actualCount)
    } catch (error) {
      console.error('getRecentTransactions error:', error)
      // If the error is due to invalid count, try with a smaller count or return empty array
      if (error && typeof error === 'object' && 'reason' in error && error.reason === 'Invalid count') {
        console.log('Invalid count error, returning empty array')
        return []
      }
      throw new Error(`Failed to get recent transactions: ${error}`)
    }
  }

  async getAllTransactions(): Promise<bigint[]> {
    try {
      if (!this.checkFunction('getAllTransactions')) {
        throw new Error('getAllTransactions function not available in contract ABI')
      }
      
      // First check the total transaction count
      const totalTransactions = await this.getTransactionCount()
      
      // If no transactions exist, return empty array
      if (totalTransactions === BigInt(0)) {
        return []
      }
      
      return await this.contract.getAllTransactions()
    } catch (error) {
      console.error('getAllTransactions error:', error)
      throw new Error(`Failed to get all transactions: ${error}`)
    }
  }

  async completeTransaction(transactionId: bigint): Promise<void> {
    try {
      if (!this.checkFunction('completeTransaction')) {
        throw new Error('completeTransaction function not available in contract ABI')
      }
      
      const tx = await this.contract.completeTransaction(transactionId)
      await tx.wait()
    } catch (error) {
      console.error('completeTransaction error:', error)
      throw new Error(`Failed to complete transaction: ${error}`)
    }
  }

  // Approval Workflow
  async requestApproval(transactionId: bigint, reason: string): Promise<void> {
    try {
      if (!this.checkFunction('requestApproval')) {
        throw new Error('requestApproval function not available in contract ABI')
      }
      
      const tx = await this.contract.requestApproval(transactionId, reason)
      await tx.wait()
    } catch (error) {
      console.error('ContractService: Request approval error:', error)
      if (error instanceof Error) {
        throw new Error(`Failed to request approval: ${error.message}`)
      } else {
        throw new Error(`Failed to request approval: ${String(error)}`)
      }
    }
  }

  async processApproval(approvalId: bigint, approved: boolean, reason: string): Promise<void> {
    try {
      if (!this.checkFunction('processApproval')) {
        throw new Error('processApproval function not available in contract ABI')
      }
      
      const tx = await this.contract.processApproval(approvalId, approved, reason)
      await tx.wait()
    } catch (error) {
      console.error('processApproval error:', error)
      throw new Error(`Failed to process approval: ${error}`)
    }
  }

  async getApproval(id: bigint): Promise<Approval> {
    try {
      if (!this.checkFunction('getApproval')) {
        throw new Error('getApproval function not available in contract ABI')
      }
      
      const approval = await this.contract.getApproval(id)
      return {
        id: convertBigIntToNumber(approval.id),
        transactionId: convertBigIntToNumber(approval.transactionId),
        requester: approval.requester,
        approver: approval.approver,
        approvalType: convertBigIntToNumberSafe(approval.approvalType),
        status: convertBigIntToNumberSafe(approval.status),
        reason: approval.reason,
        timestamp: convertBigIntToNumber(approval.timestamp)
      }
    } catch (error) {
      console.error('getApproval error:', error)
      throw new Error(`Failed to get approval: ${error}`)
    }
  }

  async getPendingApprovals(): Promise<bigint[]> {
    try {
      if (!this.checkFunction('getPendingApprovals')) {
        throw new Error('getPendingApprovals function not available in contract ABI')
      }
      
      // First check the total approval count
      const totalApprovals = await this.getApprovalCount()
      
      // If no approvals exist, return empty array
      if (totalApprovals === BigInt(0)) {
        return []
      }
      
      return await this.contract.getPendingApprovals()
    } catch (error) {
      console.error('getPendingApprovals error:', error)
      throw new Error(`Failed to get pending approvals: ${error}`)
    }
  }

  // Data Retrieval
  async getTransactionCount(): Promise<bigint> {
    try {
      if (!this.checkFunction('getTransactionCount')) {
        throw new Error('getTransactionCount function not available in contract ABI')
      }
      
      return await this.contract.getTransactionCount()
    } catch (error) {
      console.error('getTransactionCount error:', error)
      throw new Error(`Failed to get transaction count: ${error}`)
    }
  }

  async getApprovalCount(): Promise<bigint> {
    try {
      if (!this.checkFunction('getApprovalCount')) {
        throw new Error('getApprovalCount function not available in contract ABI')
      }
      
      return await this.contract.getApprovalCount()
    } catch (error) {
      console.error('getApprovalCount error:', error)
      throw new Error(`Failed to get approval count: ${error}`)
    }
  }

  async getUserCount(): Promise<bigint> {
    try {
      if (!this.checkFunction('getUserCount')) {
        throw new Error('getUserCount function not available in contract ABI')
      }
      
      return await this.contract.getUserCount()
    } catch (error) {
      console.error('getUserCount error:', error)
      throw new Error(`Failed to get user count: ${error}`)
    }
  }

  // Event Listeners
  onTransactionCreated(callback: (transactionId: bigint, from: string, to: string, amount: bigint) => void) {
    this.contract.on('TransactionCreated', callback)
  }

  onTransactionStatusUpdated(callback: (transactionId: bigint, status: number) => void) {
    this.contract.on('TransactionStatusUpdated', callback)
  }

  onApprovalRequested(callback: (approvalId: bigint, transactionId: bigint, requester: string) => void) {
    this.contract.on('ApprovalRequested', callback)
  }

  onApprovalProcessed(callback: (approvalId: bigint, status: ApprovalStatus, approver: string) => void) {
    this.contract.on('ApprovalProcessed', callback)
  }

  onUserRegistered(callback: (userId: bigint, walletAddress: string, name: string) => void) {
    this.contract.on('UserRegistered', callback)
  }

  onUserRoleUpdated(callback: (userAddress: string, newRole: UserRole) => void) {
    this.contract.on('UserRoleUpdated', callback)
  }
} 