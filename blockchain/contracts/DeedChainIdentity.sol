// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title DeedChainIdentity
 * @dev Identity and KYC management system for DeedChain
 */
contract DeedChainIdentity is AccessControl {
    using ECDSA for bytes32;
    
    bytes32 public constant KYC_PROVIDER_ROLE = keccak256("KYC_PROVIDER_ROLE");
    bytes32 public constant IDENTITY_MANAGER_ROLE = keccak256("IDENTITY_MANAGER_ROLE");
    
    enum IdentityStatus { PENDING, VERIFIED, REJECTED, SUSPENDED }
    enum IdentityTier { BASIC, VERIFIED, PREMIUM, INSTITUTIONAL }
    
    struct Identity {
        address wallet;
        string encryptedData; // IPFS hash of encrypted PII
        IdentityStatus status;
        IdentityTier tier;
        uint256 verificationDate;
        address verifiedBy;
        uint256 expiryDate;
        string countryCode;
        uint256 riskScore;
        bool isActive;
    }
    
    struct VerificationRequest {
        uint256 requestId;
        address user;
        string encryptedData;
        IdentityTier requestedTier;
        IdentityStatus status;
        uint256 submissionDate;
        uint256 reviewDate;
        address reviewedBy;
        string rejectionReason;
    }
    
    mapping(address => Identity) public identities;
    mapping(uint256 => VerificationRequest) public verificationRequests;
    mapping(address => uint256[]) public userVerificationRequests;
    mapping(string => bool) public usedDocuments; // Prevent document reuse
    
    uint256 public requestCounter;
    uint256 public constant VERIFICATION_EXPIRY = 365 days;
    uint256 public constant BASIC_TIER_LIMIT = 10; // Max properties for basic tier
    
    event IdentityRegistered(
        address indexed user,
        IdentityTier tier,
        string encryptedData,
        uint256 timestamp
    );
    
    event IdentityVerified(
        address indexed user,
        address indexed verifier,
        IdentityTier tier,
        uint256 expiryDate,
        uint256 timestamp
    );
    
    event IdentitySuspended(
        address indexed user,
        address indexed suspendedBy,
        string reason,
        uint256 timestamp
    );
    
    event IdentityUpdated(
        address indexed user,
        IdentityTier newTier,
        uint256 newExpiry,
        uint256 timestamp
    );

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(KYC_PROVIDER_ROLE, msg.sender);
        _grantRole(IDENTITY_MANAGER_ROLE, msg.sender);
    }

    function registerIdentity(
        string memory encryptedData,
        IdentityTier requestedTier,
        string memory countryCode,
        bytes memory signature
    ) public returns (uint256) {
        require(identities[msg.sender].wallet == address(0), "Identity already registered");
        require(bytes(encryptedData).length > 0, "Encrypted data required");
        
        // Verify signature to prevent spam
        bytes32 messageHash = keccak256(abi.encodePacked(msg.sender, encryptedData, requestedTier));
        address signer = messageHash.toEthSignedMessageHash().recover(signature);
        require(hasRole(KYC_PROVIDER_ROLE, signer), "Invalid signature");
        
        requestCounter++;
        
        verificationRequests[requestCounter] = VerificationRequest({
            requestId: requestCounter,
            user: msg.sender,
            encryptedData: encryptedData,
            requestedTier: requestedTier,
            status: IdentityStatus.PENDING,
            submissionDate: block.timestamp,
            reviewDate: 0,
            reviewedBy: address(0),
            rejectionReason: ""
        });
        
        userVerificationRequests[msg.sender].push(requestCounter);
        
        // Create basic identity record
        identities[msg.sender] = Identity({
            wallet: msg.sender,
            encryptedData: encryptedData,
            status: IdentityStatus.PENDING,
            tier: IdentityTier.BASIC,
            verificationDate: 0,
            verifiedBy: address(0),
            expiryDate: 0,
            countryCode: countryCode,
            riskScore: 50, // Default medium risk
            isActive: true
        });
        
        emit IdentityRegistered(msg.sender, requestedTier, encryptedData, block.timestamp);
        return requestCounter;
    }

    function verifyIdentity(
        uint256 requestId,
        IdentityTier approvedTier,
        uint256 riskScore,
        bool approved
    ) public onlyRole(KYC_PROVIDER_ROLE) {
        VerificationRequest storage request = verificationRequests[requestId];
        require(request.status == IdentityStatus.PENDING, "Request not pending");
        
        Identity storage identity = identities[request.user];
        
        if (approved) {
            identity.status = IdentityStatus.VERIFIED;
            identity.tier = approvedTier;
            identity.verificationDate = block.timestamp;
            identity.verifiedBy = msg.sender;
            identity.expiryDate = block.timestamp + VERIFICATION_EXPIRY;
            identity.riskScore = riskScore;
            
            request.status = IdentityStatus.VERIFIED;
        } else {
            identity.status = IdentityStatus.REJECTED;
            request.status = IdentityStatus.REJECTED;
        }
        
        request.reviewDate = block.timestamp;
        request.reviewedBy = msg.sender;
        
        emit IdentityVerified(request.user, msg.sender, approvedTier, identity.expiryDate, block.timestamp);
    }

    function suspendIdentity(
        address user,
        string memory reason
    ) public onlyRole(IDENTITY_MANAGER_ROLE) {
        Identity storage identity = identities[user];
        require(identity.wallet != address(0), "Identity not found");
        require(identity.status == IdentityStatus.VERIFIED, "Identity not verified");
        
        identity.status = IdentityStatus.SUSPENDED;
        identity.isActive = false;
        
        emit IdentitySuspended(user, msg.sender, reason, block.timestamp);
    }

    function reinstateIdentity(address user) public onlyRole(IDENTITY_MANAGER_ROLE) {
        Identity storage identity = identities[user];
        require(identity.status == IdentityStatus.SUSPENDED, "Identity not suspended");
        
        identity.status = IdentityStatus.VERIFIED;
        identity.isActive = true;
    }

    function updateIdentityTier(
        address user,
        IdentityTier newTier
    ) public onlyRole(IDENTITY_MANAGER_ROLE) {
        Identity storage identity = identities[user];
        require(identity.wallet != address(0), "Identity not found");
        require(identity.status == IdentityStatus.VERIFIED, "Identity not verified");
        
        identity.tier = newTier;
        identity.expiryDate = block.timestamp + VERIFICATION_EXPIRY;
        
        emit IdentityUpdated(user, newTier, identity.expiryDate, block.timestamp);
    }

    function isIdentityVerified(address user) public view returns (bool) {
        Identity memory identity = identities[user];
        return identity.status == IdentityStatus.VERIFIED && 
               identity.isActive && 
               identity.expiryDate > block.timestamp;
    }

    function getIdentityTier(address user) public view returns (IdentityTier) {
        return identities[user].tier;
    }

    function canRegisterProperty(address user) public view returns (bool, string memory) {
        Identity memory identity = identities[user];
        
        if (!isIdentityVerified(user)) {
            return (false, "Identity not verified or expired");
        }
        
        if (identity.tier == IdentityTier.BASIC) {
            // Check if user has reached basic tier limit
            // This would integrate with property registry
            return (true, "Eligible for property registration");
        }
        
        return (true, "Eligible for property registration");
    }

    function getUserVerificationHistory(address user) public view returns (uint256[] memory) {
        return userVerificationRequests[user];
    }

    function getExpiringIdentities() public view returns (address[] memory) {
        // This would return identities expiring soon (simplified)
        // In production, this would be more sophisticated
        return new address[](0);
    }

    function renewVerification(address user) public {
        Identity storage identity = identities[user];
        require(identity.wallet != address(0), "Identity not found");
        require(identity.status == IdentityStatus.VERIFIED, "Identity not verified");
        
        identity.expiryDate = block.timestamp + VERIFICATION_EXPIRY;
        
        emit IdentityUpdated(user, identity.tier, identity.expiryDate, block.timestamp);
    }
}