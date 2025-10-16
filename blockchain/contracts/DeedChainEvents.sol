// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title DeedChainEvents
 * @dev Standardized event definitions for DeedChain system
 */
library DeedChainEvents {
    // Core Property Events
    event PropertyRegistered(
        uint256 indexed tokenId,
        address indexed owner,
        string ipfsHash,
        string geoCoordinates,
        uint256 areaSize,
        string surveyNumber,
        uint256 timestamp
    );
    
    event PropertyVerified(
        uint256 indexed tokenId,
        address indexed verifier,
        uint256 timestamp
    );
    
    event PropertyTransferred(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        uint256 price,
        uint256 timestamp
    );
    
    // Tokenization Events
    event PropertyTokenized(
        uint256 indexed propertyId,
        address indexed landShareToken,
        string tokenName,
        string tokenSymbol,
        uint256 totalShares,
        address indexed tokenizer,
        uint256 timestamp
    );
    
    event SharesDistributed(
        uint256 indexed propertyId,
        address indexed distributor,
        address[] recipients,
        uint256[] amounts,
        uint256 timestamp
    );
    
    event PropertyRedeemed(
        uint256 indexed propertyId,
        address indexed redeemer,
        uint256 timestamp
    );
    
    // Marketplace Events
    event ListingCreated(
        uint256 indexed listingId,
        address indexed seller,
        uint8 assetType,
        uint8 listingType,
        uint256 assetId,
        uint256 quantity,
        uint256 price,
        uint256 endTime,
        uint256 timestamp
    );
    
    event ListingSold(
        uint256 indexed listingId,
        address indexed seller,
        address indexed buyer,
        uint256 price,
        uint256 fee,
        uint256 timestamp
    );
    
    event BidPlaced(
        uint256 indexed auctionId,
        address indexed bidder,
        uint256 amount,
        uint256 timestamp
    );
    
    // Governance Events
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        uint8 proposalType,
        string description,
        uint256 timestamp
    );
    
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        bool support,
        uint256 weight,
        uint256 timestamp
    );
    
    event ProposalExecuted(
        uint256 indexed proposalId,
        address indexed executor,
        uint256 timestamp
    );
    
    // Security Events
    event SecurityAlertRaised(
        uint256 indexed alertId,
        uint8 eventType,
        uint8 threatLevel,
        address indexed targetAddress,
        address indexed reportedBy,
        string description,
        uint256 timestamp
    );
    
    event AddressBlacklisted(
        address indexed wallet,
        string reason,
        address indexed blacklistedBy,
        uint256 timestamp
    );
    
    // Cross-chain Events
    event BridgeRequestCreated(
        uint256 indexed requestId,
        uint256 indexed propertyId,
        address indexed owner,
        uint256 targetChainId,
        uint256 timestamp
    );
    
    event BridgeCompleted(
        uint256 indexed requestId,
        uint256 indexed propertyId,
        address indexed owner,
        uint256 targetChainId,
        uint256 timestamp
    );
    
    // Rental Events
    event RentalAgreementCreated(
        uint256 indexed agreementId,
        uint256 indexed propertyId,
        address indexed landlord,
        address tenant,
        uint256 monthlyRent,
        uint256 securityDeposit,
        uint256 startDate,
        uint256 endDate,
        uint256 timestamp
    );
    
    event RentalPaymentMade(
        uint256 indexed agreementId,
        address indexed tenant,
        uint256 amount,
        uint256 periodStart,
        uint256 periodEnd,
        uint256 timestamp
    );
    
    // Insurance Events
    event PolicyIssued(
        uint256 indexed policyId,
        uint256 indexed propertyId,
        address indexed insured,
        uint256 coverageAmount,
        uint256 premiumAmount,
        uint256 endDate,
        uint256 timestamp
    );
    
    event ClaimFiled(
        uint256 indexed claimId,
        uint256 indexed policyId,
        address indexed claimant,
        uint256 claimAmount,
        string claimReason,
        uint256 timestamp
    );
    
    // System Events
    event SystemUpgraded(
        string newVersion,
        address upgradedBy,
        uint256 timestamp
    );
    
    event EmergencyPaused(
        address pausedBy,
        string reason,
        uint256 timestamp
    );
    
    event FundsDeposited(
        address indexed from,
        uint256 amount,
        string purpose,
        uint256 timestamp
    );
    
    event FundsWithdrawn(
        address indexed to,
        uint256 amount,
        string purpose,
        uint256 timestamp
    );
}