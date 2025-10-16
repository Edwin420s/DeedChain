// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title DeedChainSecurity
 * @dev Security and monitoring system for DeedChain ecosystem
 */
contract DeedChainSecurity is AccessControl, ReentrancyGuard {
    bytes32 public constant SECURITY_MANAGER_ROLE = keccak256("SECURITY_MANAGER_ROLE");
    bytes32 public constant MONITOR_ROLE = keccak256("MONITOR_ROLE");
    
    enum ThreatLevel { LOW, MEDIUM, HIGH, CRITICAL }
    enum SecurityEvent { SUSPICIOUS_TRANSFER, UNUSUAL_ACTIVITY, POTENTIAL_FRAUD, SYSTEM_BREACH }
    
    struct SecurityAlert {
        uint256 alertId;
        SecurityEvent eventType;
        ThreatLevel level;
        address reportedBy;
        address targetAddress;
        string description;
        string evidence;
        uint256 timestamp;
        bool resolved;
        address resolvedBy;
        string resolution;
    }
    
    struct AddressReputation {
        address wallet;
        uint256 trustScore; // 0-100
        uint256 flaggedCount;
        uint256 verifiedCount;
        uint256 lastActivity;
        bool isBlacklisted;
        string blacklistReason;
    }
    
    mapping(uint256 => SecurityAlert) public securityAlerts;
    mapping(address => AddressReputation) public addressReputations;
    mapping(address => uint256[]) public addressAlerts;
    mapping(bytes32 => bool) public transactionPatterns;
    
    uint256 public alertCounter;
    uint256 public constant MIN_TRUST_SCORE = 30;
    
    event SecurityAlertRaised(
        uint256 indexed alertId,
        SecurityEvent eventType,
        ThreatLevel level,
        address indexed targetAddress,
        address indexed reportedBy,
        string description,
        uint256 timestamp
    );
    
    event AlertResolved(
        uint256 indexed alertId,
        address resolvedBy,
        string resolution,
        uint256 timestamp
    );
    
    event AddressBlacklisted(
        address indexed wallet,
        string reason,
        address indexed blacklistedBy,
        uint256 timestamp
    );
    
    event AddressWhitelisted(
        address indexed wallet,
        address indexed whitelistedBy,
        uint256 timestamp
    );

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(SECURITY_MANAGER_ROLE, msg.sender);
        _grantRole(MONITOR_ROLE, msg.sender);
    }

    function raiseAlert(
        SecurityEvent eventType,
        ThreatLevel level,
        address targetAddress,
        string memory description,
        string memory evidence
    ) public returns (uint256) {
        require(bytes(description).length > 0, "Description required");
        
        alertCounter++;
        
        securityAlerts[alertCounter] = SecurityAlert({
            alertId: alertCounter,
            eventType: eventType,
            level: level,
            reportedBy: msg.sender,
            targetAddress: targetAddress,
            description: description,
            evidence: evidence,
            timestamp: block.timestamp,
            resolved: false,
            resolvedBy: address(0),
            resolution: ""
        });
        
        addressAlerts[targetAddress].push(alertCounter);
        
        // Update reputation
        AddressReputation storage reputation = addressReputations[targetAddress];
        if (reputation.wallet == address(0)) {
            reputation.wallet = targetAddress;
            reputation.trustScore = 50; // Default score
        }
        
        reputation.flaggedCount++;
        reputation.trustScore = _calculateTrustScore(reputation);
        reputation.lastActivity = block.timestamp;
        
        emit SecurityAlertRaised(
            alertId,
            eventType,
            level,
            targetAddress,
            msg.sender,
            description,
            block.timestamp
        );
        
        return alertCounter;
    }

    function resolveAlert(
        uint256 alertId,
        string memory resolution,
        bool adjustReputation
    ) public onlyRole(SECURITY_MANAGER_ROLE) {
        SecurityAlert storage alert = securityAlerts[alertId];
        require(!alert.resolved, "Alert already resolved");
        
        alert.resolved = true;
        alert.resolvedBy = msg.sender;
        alert.resolution = resolution;
        
        if (adjustReputation) {
            AddressReputation storage reputation = addressReputations[alert.targetAddress];
            reputation.trustScore = _calculateTrustScore(reputation);
        }
        
        emit AlertResolved(alertId, msg.sender, resolution, block.timestamp);
    }

    function blacklistAddress(
        address wallet,
        string memory reason
    ) public onlyRole(SECURITY_MANAGER_ROLE) {
        AddressReputation storage reputation = addressReputations[wallet];
        require(!reputation.isBlacklisted, "Address already blacklisted");
        
        reputation.isBlacklisted = true;
        reputation.blacklistReason = reason;
        reputation.trustScore = 0;
        
        emit AddressBlacklisted(wallet, reason, msg.sender, block.timestamp);
    }

    function whitelistAddress(address wallet) public onlyRole(SECURITY_MANAGER_ROLE) {
        AddressReputation storage reputation = addressReputations[wallet];
        require(reputation.isBlacklisted, "Address not blacklisted");
        
        reputation.isBlacklisted = false;
        reputation.blacklistReason = "";
        reputation.trustScore = 80; // Reset to good score
        
        emit AddressWhitelisted(wallet, msg.sender, block.timestamp);
    }

    function isAddressBlacklisted(address wallet) public view returns (bool) {
        return addressReputations[wallet].isBlacklisted;
    }

    function getTrustScore(address wallet) public view returns (uint256) {
        return addressReputations[wallet].trustScore;
    }

    function canInteract(address wallet) public view returns (bool, string memory) {
        AddressReputation memory reputation = addressReputations[wallet];
        
        if (reputation.isBlacklisted) {
            return (false, "Address is blacklisted");
        }
        
        if (reputation.trustScore < MIN_TRUST_SCORE) {
            return (false, "Trust score too low");
        }
        
        return (true, "Address can interact");
    }

    function recordPositiveActivity(address wallet) public onlyRole(MONITOR_ROLE) {
        AddressReputation storage reputation = addressReputations[wallet];
        if (reputation.wallet == address(0)) {
            reputation.wallet = wallet;
            reputation.trustScore = 50;
        }
        
        reputation.verifiedCount++;
        reputation.trustScore = _calculateTrustScore(reputation);
        reputation.lastActivity = block.timestamp;
    }

    function _calculateTrustScore(AddressReputation memory reputation) internal pure returns (uint256) {
        if (reputation.isBlacklisted) {
            return 0;
        }
        
        uint256 baseScore = 50;
        uint256 positiveImpact = reputation.verifiedCount * 5; // +5 per verification
        uint256 negativeImpact = reputation.flaggedCount * 10; // -10 per flag
        
        int256 finalScore = int256(baseScore) + int256(positiveImpact) - int256(negativeImpact);
        
        if (finalScore < 0) return 0;
        if (finalScore > 100) return 100;
        
        return uint256(finalScore);
    }

    function getAddressAlerts(address wallet) public view returns (uint256[] memory) {
        return addressAlerts[wallet];
    }

    function getActiveAlerts() public view returns (uint256[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 1; i <= alertCounter; i++) {
            if (!securityAlerts[i].resolved) {
                activeCount++;
            }
        }
        
        uint256[] memory activeAlerts = new uint256[](activeCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 1; i <= alertCounter; i++) {
            if (!securityAlerts[i].resolved) {
                activeAlerts[currentIndex] = i;
                currentIndex++;
            }
        }
        
        return activeAlerts;
    }

    function registerTransactionPattern(bytes32 patternHash) public onlyRole(MONITOR_ROLE) {
        transactionPatterns[patternHash] = true;
    }

    function isKnownPattern(bytes32 patternHash) public view returns (bool) {
        return transactionPatterns[patternHash];
    }
}