// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title DeedChainConstants
 * @dev Centralized constants and configuration for DeedChain system
 */
library DeedChainConstants {
    // Network IDs
    uint256 public constant LINEA_MAINNET = 59144;
    uint256 public constant LINEA_TESTNET = 59140;
    uint256 public constant POLYGON_MAINNET = 137;
    uint256 public constant ETHEREUM_MAINNET = 1;
    
    // Role Hashes
    bytes32 public constant DEFAULT_ADMIN_ROLE = 0x00;
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant VALIDATOR_ROLE = keccak256("VALIDATOR_ROLE");
    bytes32 public constant TREASURER_ROLE = keccak256("TREASURER_ROLE");
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");
    
    // Time Constants
    uint256 public constant SECONDS_PER_DAY = 86400;
    uint256 public constant SECONDS_PER_WEEK = 604800;
    uint256 public constant SECONDS_PER_MONTH = 2592000;
    uint256 public constant SECONDS_PER_YEAR = 31536000;
    
    // Fee Constants (in basis points: 100 = 1%)
    uint256 public constant PLATFORM_FEE_BP = 25; // 0.25%
    uint256 public constant INSURANCE_PREMIUM_BP = 100; // 1%
    uint256 public constant BRIDGE_FEE_BP = 50; // 0.5%
    uint256 public constant MARKETPLACE_FEE_BP = 25; // 0.25%
    
    // Limits
    uint256 public constant MAX_PROPERTIES_PER_OWNER = 50;
    uint256 public constant MIN_PROPERTY_AREA = 1; // 1 square meter
    uint256 public constant MAX_PROPERTY_AREA = 1000000000; // 1 billion sqm
    uint256 public constant MAX_TOKENIZATION_SHARES = 1000000000 * 10**18; // 1 billion
    
    // Verification
    uint256 public constant VERIFICATION_TIMEOUT = 30 days;
    uint256 public constant MIN_VERIFIER_STAKE = 1000 * 10**18; // 1000 tokens
    uint256 public constant VERIFICATION_QUORUM = 3; // Minimum verifiers
    
    // Auction
    uint256 public constant AUCTION_DURATION = 7 days;
    uint256 public constant MIN_BID_INCREASE_BP = 500; // 5%
    uint256 public constant AUCTION_EXTENSION = 15 minutes;
    
    // Rental
    uint256 public constant MIN_RENTAL_DURATION = 30 days;
    uint256 public constant MAX_RENTAL_DURATION = 365 days;
    uint256 public constant SECURITY_DEPOSIT_MULTIPLIER = 2; // 2 months rent
    
    // Security
    uint256 public constant MAX_GAS_PRICE = 100 gwei;
    uint256 public constant EMERGENCY_TIMELOCK = 2 days;
    uint256 public constant MIN_TRUST_SCORE = 30; // 0-100 scale
    
    // Tokenomics
    uint256 public constant TOTAL_SUPPLY = 100_000_000 * 10**18; // 100 million
    uint256 public constant TEAM_ALLOCATION = 20_000_000 * 10**18; // 20%
    uint256 public constant ECOSYSTEM_FUND = 15_000_000 * 10**18; // 15%
    uint256 public constant LIQUIDITY_POOL = 10_000_000 * 10**18; // 10%
    uint256 public constant COMMUNITY_REWARDS = 55_000_000 * 10**18; // 55%
    
    // Addresses (to be set during deployment)
    address public constant TREASURY_MULTISIG = address(0); // Set during deployment
    address public constant TEAM_MULTISIG = address(0); // Set during deployment
    address public constant ECOSYSTEM_FUND_WALLET = address(0); // Set during deployment
    
    // IPFS
    string public constant IPFS_GATEWAY = "https://ipfs.io/ipfs/";
    string public constant METADATA_SCHEMA = "deedchain-property-v1";
    
    // Error Messages
    string public constant ERROR_NOT_OWNER = "Not property owner";
    string public constant ERROR_NOT_VERIFIED = "Property not verified";
    string public constant ERROR_INSUFFICIENT_BALANCE = "Insufficient balance";
    string public constant ERROR_TRANSFER_FAILED = "Transfer failed";
    string public constant ERROR_UNAUTHORIZED = "Unauthorized access";
    string public constant ERROR_PROPERTY_FROZEN = "Property frozen";
    string public constant ERROR_INVALID_PARAMS = "Invalid parameters";
}