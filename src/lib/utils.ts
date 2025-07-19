import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function to format numbers professionally
export const formatNumber = (value: number): string => {
  if (value === 0) return '0'
  if (value < 1) return value.toFixed(1)
  return Math.round(value).toLocaleString()
}

// Utility function to format ETH amounts professionally
export const formatEthAmount = (value: number): string => {
  if (value === 0) return '0 ETH'
  if (value < 0.01) return `${value.toFixed(4)} ETH`
  if (value < 1) return `${value.toFixed(2)} ETH`
  return `${value.toLocaleString(undefined, { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 4 
  })} ETH`
}

// Utility function to format currency amounts professionally
export const formatCurrency = (value: number, currency: string = 'USD'): string => {
  if (value === 0) return `0 ${currency}`
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
} 