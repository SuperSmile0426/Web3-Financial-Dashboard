# Web3 Financial Dashboard

A comprehensive dashboard for managing financial transactions, approvals, and users with **Web3 integration**. The frontend integrates with smart contracts to provide a real blockchain-based financial management system.

## 🚀 Features

### Core Functionalities

- **Dashboard Overview**: Display key metrics from blockchain (total transactions, pending approvals, active deals)
- **Transaction Management**: View, create, and manage transactions through smart contract calls
- **Approval Workflow**: Process approvals and track approval history from blockchain
- **User Management**: Manage user roles and permissions through smart contract calls
- **Real-time Updates**: Listen to smart contract events for live updates

### Web3 Integration

- **MetaMask Integration**: Connect to MetaMask or other Web3 wallets
- **Smart Contract Interaction**: Full integration with FinancialPlatform smart contract
- **Role-Based Access Control**: User roles (Regular, Manager, Admin) with permission checks
- **Real-time Event Listening**: Live updates from blockchain events

## 🛠 Tech Stack

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling (no hardcoded CSS)
- **React Query** for data fetching and caching
- **Shadcn/ui** components for consistent UI
- **React Hook Form** + Zod for form validation
- **Ethers.js** for Web3 integration
- **Lucide React** for icons

## 📋 Prerequisites

- Node.js 18+ 
- MetaMask browser extension
- Access to a blockchain network (localhost for development, Sepolia for testing)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
```

**Note**: Replace the contract address with your deployed FinancialPlatform contract address.

### 3. Deploy Smart Contracts

Navigate to the contract directory and deploy the contracts:

```bash
cd contract-technical-assignment
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network localhost
```

Copy the deployed contract address and update your `.env.local` file.

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Smart Contract Integration

### Contract Functions

The dashboard integrates with the following smart contract functions:

**User Management:**
- `getUser(address)` - Get user information
- `registerUser(address, name, email, role)` - Register new user (admin only)
- `updateUserRole(address, role)` - Update user role (admin only)

**Transaction Management:**
- `createTransaction(to, amount, description)` - Create new transaction
- `getTransaction(id)` - Get transaction details
- `getUserTransactions(address)` - Get user's transactions
- `completeTransaction(id)` - Complete approved transaction

**Approval Workflow:**
- `requestApproval(transactionId, reason)` - Request approval for transaction
- `processApproval(approvalId, approved, reason)` - Process approval
- `getApproval(id)` - Get approval details
- `getPendingApprovals()` - Get all pending approvals

**Data Retrieval:**
- `getTransactionCount()` - Get total transaction count
- `getApprovalCount()` - Get total approval count
- `getUserCount()` - Get total user count

## 🎯 User Roles & Permissions

### Role Hierarchy

1. **Regular User**
   - Create transactions
   - Request approvals
   - View own transactions

2. **Manager**
   - All Regular user permissions
   - Process approvals
   - View all transactions

3. **Admin**
   - All Manager permissions
   - Register new users
   - Update user roles
   - Full system access

## 📱 Dashboard Sections

### 1. Overview Tab
- Key metrics from blockchain
- Recent activity feed
- Quick action buttons

### 2. Transactions Tab
- List all transactions with filtering
- Create new transactions
- View transaction details
- Track transaction status

### 3. Approvals Tab
- Pending approvals list
- Approve/reject requests
- Approval history
- Real-time notifications

### 4. Users Tab (Admin Only)
- User list with roles
- Add new users
- Manage user permissions
- User activity tracking

## 🔐 Wallet Connection

### Supported Networks

- **Development**: Localhost (Hardhat)
- **Testing**: Sepolia testnet
- **Production**: Ethereum mainnet (configure as needed)

### Connection Flow

1. Click "Connect Wallet" button
2. Approve MetaMask connection
3. Switch to correct network if prompted
4. Dashboard loads with user's role and permissions

## 🎨 UI Components

The dashboard uses a modern, responsive design with:

- **Shadcn/ui** components for consistency
- **Tailwind CSS** for styling
- **Lucide React** icons
- **Dark/Light mode** support (configurable)
- **Mobile-responsive** layout

## 🔄 Real-time Updates

The dashboard listens to smart contract events for real-time updates:

- New transaction notifications
- Approval status changes
- User role updates
- System-wide notifications


## 📦 Build & Deploy

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Deployed contract address | Yes |
| `NEXT_PUBLIC_NETWORK_ID` | Network ID (default: 31337) | No |

### Network Configuration

Update the network configuration in `src/components/web3-provider.tsx` for different networks.

<img width="1670" height="909" alt="Screenshot 2025-07-21 002314" src="https://github.com/user-attachments/assets/23965553-2005-47cb-ad0c-ee9a12772bf7" />
<img width="1162" height="933" alt="Screenshot 2025-07-21 002351" src="https://github.com/user-attachments/assets/5ce05951-f4e8-41ef-b7f3-2bb5327f28c0" />
<img width="1634" height="748" alt="Screenshot 2025-07-21 002413" src="https://github.com/user-attachments/assets/f5b787fe-c8e7-43f2-89da-c41959db4b7e" />
<img width="1646" height="895" alt="Screenshot 2025-07-21 002436" src="https://github.com/user-attachments/assets/e7b08faa-ee1a-4dcb-bd3f-3e7b51b44994" />
<img width="1680" height="845" alt="Screenshot 2025-07-21 002552" src="https://github.com/user-attachments/assets/71776e89-0dd4-4017-853d-432ddaf6f0af" />


