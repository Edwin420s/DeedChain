# DeedChain

DeedChain is a Web3 platform for land ownership verification and tokenization.

## Monorepo Structure
- `client/` – Next.js frontend (Tailwind, Wagmi)
- `server/` – Node.js + Express backend (PostgreSQL)
- `blockchain/` – Solidity smart contracts (Linea zkEVM)
- `scripts/` – Deployment and automation scripts
- `database/` – Prisma schema & migrations
- `docs/` – Architecture and pitch materials
- `tests/` – Cross-repo test scenarios

## Quick Start
1. Install dependencies: `npm run bootstrap`
2. Configure env: edit `.env` and service-specific env files
3. Build all: `npm run build`
4. Deploy: `npm run deploy`

## Environments
- Default chain: Linea zkEVM (configure `RPC_URL`)

## Licensing
See `LICENSE`.
