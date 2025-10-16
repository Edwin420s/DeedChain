# DeedChain Smart Contracts

A decentralized land registry and property tokenization platform built on Linea zkEVM.

## Contracts Overview

### Core Contracts

1. **DeedNFT** - ERC721 tokens representing property deeds
2. **LandRegistry** - Manages property transfers and ownership
3. **TokenizationManager** - Handles fractional ownership through ERC20 tokens
4. **DAOVerification** - Community-based property verification system
5. **DeedChainGovernance** - Governance and staking for validators

### Key Features

- **Property Registration**: Mint NFTs for land parcels with IPFS metadata
- **DAO Verification**: Community-driven property validation
- **Secure Transfers**: Multi-signature property ownership transfers
- **Fractional Ownership**: Tokenize properties into tradeable shares
- **Governance**: Staking and voting mechanisms for validators

## Development

### Prerequisites

- Node.js 16+
- Hardhat
- MetaMask or similar wallet

### Installation

```bash
npm install
```
### Compilation
```
npx hardhat compile
```
### Testing
```
npx hardhat test
```
### Deployment
Set up environment variables:
```
cp .env.example .env
# Fill in your configuration
```
### Deploy to Linea: 
```
npx hardhat run scripts/deploy.js --network linea
```
### Setup roles: 
```
npx hardhat run scripts/setup-roles.js --network linea
```
### Contract Architecture 
```
DeedChain/
├── DeedNFT (ERC721)
│   ├── Property registration
│   ├── Verification system
│   └── Ownership tracking
├── LandRegistry
│   ├── Transfer requests
│   ├── Approval workflow
│   └── Ownership history
├── TokenizationManager
│   ├── Fractionalization
│   ├── LandShare tokens (ERC20)
│   └── Redemption mechanism
└── DAOVerification
    ├── Proposal system
    ├── Voting mechanism
    └── Validator management
    
```
### Security Features 
Role-based access control

Multi-signature transfers

DAO-based verification

Secure tokenization with redemption

Comprehensive test coverage

### License
```

## blockchain/package.json (Updated)

```json
{
  "name": "deedchain-contracts",
  "version": "1.0.0",
  "description": "Smart contracts for DeedChain land tokenization platform",
  "main": "index.js",
  "scripts": {
    "compile": "hardhat compile",
    "deploy": "hardhat run scripts/deploy.js --network linea",
    "deploy:testnet": "hardhat run scripts/deploy.js --network linea_testnet",
    "setup": "hardhat run scripts/setup-roles.js --network linea",
    "setup:testnet": "hardhat run scripts/setup-roles.js --network linea_testnet",
    "mock": "hardhat run scripts/mock-data.js --network linea",
    "test": "hardhat test",
    "test:coverage": "hardhat coverage",
    "verify": "hardhat verify --network linea",
    "lint": "solhint contracts/**/*.sol",
    "lint:fix": "solhint contracts/**/*.sol --fix"
  },
  "devDependencies": {
    "@nomiclabs/hardhat-ethers": "^2.2.3",
    "@nomiclabs/hardhat-waffle": "^2.0.6",
    "@nomiclabs/hardhat-etherscan": "^3.1.7",
    "@openzeppelin/contracts": "^4.9.3",
    "chai": "^4.3.10",
    "dotenv": "^16.3.1",
    "ethereum-waffle": "^4.0.10",
    "ethers": "^5.7.2",
    "hardhat": "^2.17.0",
    "hardhat-gas-reporter": "^1.0.9",
    "solhint": "^3.4.1",
    "solidity-coverage": "^0.8.5"
  }
}
```
