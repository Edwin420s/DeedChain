# Environment Configuration Guide

This guide explains environment variables used across the monorepo. Values are defined in root `.env` and propagated to services as needed.

## Blockchain
- `CHAIN_NAME` – Target chain label (e.g., `linea`, `polygon`).
- `RPC_URL` – HTTPS RPC endpoint (Alchemy/Infura/provider).
- `PRIVATE_KEY` – Deployer/account private key (DO NOT COMMIT).
- `REGISTRY_CONTRACT_ADDRESS` – Address of deployed registry (filled after deploy).

## IPFS / Pinning
- `IPFS_TOKEN` – Token for web3.storage or similar service.
- `PINATA_JWT` – Pinata JWT if using Pinata pinning API.

## Database
- `DATABASE_URL` – PostgreSQL connection string (e.g., `postgres://user:pass@host:port/db`).

## Frontend Public Vars
- `NEXT_PUBLIC_CHAIN_NAME` – Exposes chain name to client.
- `NEXT_PUBLIC_REGISTRY_CONTRACT_ADDRESS` – Public contract address for client.

## Security Tips
- Never commit real secrets; use `.env.local` files and secret managers in CI/CD.
- Use separate keys per environment (dev/staging/prod).
- Rotate keys regularly and restrict RPC project IDs to your app.
