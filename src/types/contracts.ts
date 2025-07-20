import { ethers } from 'ethers'
import FinancialPlatformArtifact from '../lib/FinancialPlatform.json'

// Contract ABI types based on the FinancialPlatform contract
export interface Transaction {
  id: number
  from: string
  to: string
  amount: bigint
  description: string
  status: number // TransactionStatus enum
  timestamp: number
  approvalId: number
}

export interface Approval {
  id: number
  transactionId: number
  requester: string
  approver: string
  approvalType: number // ApprovalType enum
  status: number // ApprovalStatus enum
  reason: string
  timestamp: number
}

export interface User {
  id: number
  walletAddress: string
  name: string
  email: string
  role: number // UserRole enum
  isActive: boolean
  createdAt: number
}

// Enums
export enum TransactionStatus {
  Pending = 0,
  Active = 1,
  Completed = 2,
  Rejected = 3
}

export enum ApprovalStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2
}

export enum ApprovalType {
  Transaction = 0,
  UserRole = 1,
  SystemConfig = 2
}

export enum UserRole {
  Regular = 0,
  Manager = 1,
  Admin = 2
}

// Contract factory with proper ABI
export class FinancialPlatform__factory {
  static connect(address: string, signer: ethers.Signer) {
    return new ethers.Contract(address, FinancialPlatformArtifact.abi, signer)
  }
}

// Extend Window interface for ethereum
declare global {
  interface Window {
    ethereum?: any
  }
} 