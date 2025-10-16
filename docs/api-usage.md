# API Usage Guide

This guide summarizes representative backend endpoints and how to call them. Adjust paths to match the implementation in `server/`.

## Authentication
- Wallet-based: Sign a nonce with the user's wallet.
- JWT: Include `Authorization: Bearer <token>` in requests (if configured).

## Endpoints (Representative)

### Register Property
POST /api/property/register
Body (JSON):
{
  "ipfsHash": "ipfs://...",
  "geoData": "{\"lat\": -1.28, \"lng\": 36.82}",
  "metadata": { "parcelId": "KEN-001", "area": "2.5 acres" }
}
Response: 200 OK
{
  "deedId": 123,
  "txHash": "0x...",
  "status": "pending_verification"
}

### Get Property
GET /api/property/:id
Response: 200 OK
{
  "deedId": 123,
  "owner": "0xabc...",
  "verified": true,
  "ipfsHash": "ipfs://...",
  "geoData": {"lat": -1.28, "lng": 36.82}
}

### Initiate Transfer
POST /api/transfer
Body (JSON):
{
  "deedId": 123,
  "to": "0xBuyer..."
}
Response: 200 OK
{
  "txHash": "0x...",
  "status": "awaiting_counterparty"
}

### Verify Deed (Validator)
POST /api/verify
Body (JSON):
{
  "deedId": 123,
  "approve": true
}
Response: 200 OK
{
  "deedId": 123,
  "verified": true,
  "txHash": "0x..."
}

## Errors
- 400: Validation error
- 401: Unauthorized / missing JWT
- 403: Forbidden (insufficient role)
- 404: Not found
- 500: Server error
