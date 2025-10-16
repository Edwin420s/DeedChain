// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title DeedChainErrors
 * @dev Custom error definitions for gas-efficient reverts
 */
library DeedChainErrors {
    // Access Control Errors
    error UnauthorizedAccess();
    error NotPropertyOwner();
    error NotRegistrar();
    error NotVerifier();
    error NotAdmin();
    error NotValidator();
    
    // Property Errors
    error PropertyNotExists();
    error PropertyNotVerified();
    error PropertyAlreadyVerified();
    error PropertyFrozen();
    error PropertyTokenized();
    error PropertyNotTokenized();
    
    // Transfer Errors
    error TransferNotAllowed();
    error TransferNotApproved();
    error InvalidRecipient();
    error SelfTransferNotAllowed();
    
    // Tokenization Errors
    error InsufficientShares();
    error InvalidTokenization();
    tokenizationInProgress();
    error RedemptionNotAllowed();
    
    // Marketplace Errors
    error InvalidListing();
    error ListingNotActive();
    error InsufficientBid();
    error AuctionEnded();
    error AuctionNotEnded();
    error ReserveNotMet();
    
    // Verification Errors
    error VerificationFailed();
    error AlreadyVoted();
    error QuorumNotMet();
    error VerificationExpired();
    
    // Financial Errors
    error InsufficientBalance();
    error InsufficientAllowance();
    error TransferFailed();
    error InvalidAmount();
    error PriceTooLow();
    
    // Rental Errors
    error RentalNotActive();
    error RentalPeriodNotStarted();
    error RentalPeriodEnded();
    error InvalidRentalDuration();
    error PaymentAlreadyMade();
    
    // Insurance Errors
    error PolicyNotActive();
    error ClaimAlreadyFiled();
    error CoverageExceeded();
    error InvalidClaim();
    
    // Bridge Errors
    error ChainNotSupported();
    error BridgeNotActive();
    error InvalidBridgeRequest();
    error CrossChainTxFailed();
    
    // Security Errors
    error AddressBlacklisted();
    error TrustScoreTooLow();
    error SuspiciousActivity();
    error EmergencyModeActive();
    
    // Governance Errors
    error ProposalNotActive();
    error VotingPeriodEnded();
    error InsufficientVotingPower();
    error TimelockNotPassed();
    
    // Parameter Errors
    error InvalidParameter();
    error ArrayLengthMismatch();
    error InvalidAddress();
    error InvalidString();
    error ValueOutOfBounds();
    
    // System Errors
    error SystemPaused();
    error UpgradeNotAllowed();
    error ContractNotInitialized();
    error FeatureNotImplemented();
    
    // Time Errors
    error InvalidTimestamp();
    error TimeNotReached();
    error TimeExpired();
    error DurationTooShort();
    
    // Emergency Errors
    error EmergencyOnly();
    error RecoveryInProgress();
    error BackupNotVerified();
}