# NFT Marketplace on Aptos

A decentralized NFT marketplace built on the Aptos blockchain with Next.js.

## Features

- **NFT Minting**: Create and mint unique NFTs with customizable properties

  - Name, description, image URI
  - Rarity levels (Common, Uncommon, Rare, Epic, Legendary)

- **NFT Marketplace**

  - List NFTs for sale
  - Purchase NFTs using APT tokens
  - View all listed NFTs in the marketplace
  - Transfer owned NFTs to other addresses

- **User Dashboard**

  - View owned NFTs (minted and purchased)
  - Manage NFT listings
  - Track received NFTs

- **Statistics**

  - Total volume
  - Active creators
  - NFT marketplace metrics
  - Sales analytics

- **Creator Support**

  - Direct APT donations to NFT creators
  - Creator statistics and portfolio

- **Wallet Integration**
  - Petra Wallet support
  - Protected routes for authenticated users
  - Persistent wallet connection

## Setup Instructions

### Smart Contract Deployment

1. Deploy the NFT Marketplace contract to Aptos testnet
2. Note down the contract address

### Environment Setup

1. Create a new `/config/constants.ts` file in the project root:

```
MARKETPLACE_ADDRESS=your_contract_address
CONTRACT_NAME=NFTMarketplace
```

### Project Setup

1. Install dependencies:

```bash
npm install or npm install --force
```

2. Update the contract constants in `src/config/constants.ts`:

```typescript
export const MARKETPLACE_ADDRESS = "your_contract_address";
export const CONTRACT_NAME = "NFTMarketplace";
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser

### Prerequisites

- Node.js 16.8 or later
- Petra Wallet browser extension
- APT tokens (testnet) for transactions

## Contract Initialization

After deployment, initialize the marketplace:

1. Connect your wallet
2. The marketplace will automatically attempt initialization on first connection
3. You can now start minting and trading NFTs

## Development

The project uses:

- Next.js 15 with App Router
- TypeScript
- Tailwind CSS
- Shadcn UI Components Library
- Aptos Web3 SDK
- Petra Wallet Adapter
