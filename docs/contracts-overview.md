# Contracts Overview

This document summarizes the on-chain architecture and expected behaviors. Consult `blockchain/contracts/` for actual implementations.

## LandRegistry
- Purpose: Lifecycle management of property deeds: registration, verification, transfers.
- Key Concepts:
  - Deed ID: Unique on-chain identifier.
  - IPFS CID: Off-chain metadata pointer (survey docs, coordinates, owner-provided data).
  - Roles: `REGISTRAR`, `VALIDATOR`, `ADMIN` (names indicative; see code for actual roles).
- Typical Functions:
  - `registerDeed(ipfsHash, geoData)` – Submit a new property for registration.
  - `verifyDeed(deedId)` – Mark a deed as verified (restricted to validators).
  - `transferOwnership(deedId, newOwner)` – Transfer ownership when approvals are met.
  - `getDeed(deedId)` – Read deed struct (owner, verified flag, metadata pointers, etc.).
- Events:
  - `DeedRegistered(deedId, owner, ipfsHash)`
  - `DeedVerified(deedId, validator)`
  - `OwnershipTransferred(deedId, from, to)`

## Deed NFT (ERC-721)
- Purpose: Tokenized proof of ownership per parcel.
- Metadata: URI resolves to IPFS JSON that includes parcel info, docs links, and timestamps.
- Focus Areas:
  - Non-transferable prior to verification (optional, via registry gating).
  - Royalty/fee hooks (optional) for platform/DAO.

## Fractionalization (ERC-20 LandShares)
- Purpose: Optional conversion of a deed into fractional tokens.
- Typical Flow:
  - Lock deed in a vault contract.
  - Mint fixed supply of ERC-20 LandShares representing fractional interests.
  - Distribute or list tokens via marketplace.
- Considerations:
  - Redemption/buyout logic (future).
  - Compliance and KYC gating (jurisdiction-dependent).

## Validator DAO / Access Control
- Purpose: Authorize and govern validators; manage staking and reputation.
- Features:
  - Role-based access control for `VALIDATOR` actions.
  - Optional staking requirements and slashing.
  - Voting on disputes and validator onboarding.

## Security Notes
- Use OpenZeppelin libraries for ERC standards and access control.
- Apply checks-effects-interactions and reentrancy guards.
- Emit events for all state transitions.
- Add pausable/emergency stop where appropriate.
