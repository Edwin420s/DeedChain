// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title DeedChainAPI
 * @dev API management and access control for DeedChain services
 */
contract DeedChainAPI is AccessControl {
    bytes32 public constant API_MANAGER_ROLE = keccak256("API_MANAGER_ROLE");
    
    enum APITier { FREE, DEVELOPER, ENTERPRISE, PARTNER }
    
    struct APIKey {
        bytes32 keyHash;
        address owner;
        APITier tier;
        uint256 rateLimit; // Requests per minute
        uint256 totalRequests;
        uint256 lastReset;
        bool isActive;
        string description;
        uint256 createdDate;
        uint256 expiryDate;
    }
    
    struct APIUsage {
        uint256 totalRequests;
        uint256 thisMinute;
        uint256 lastRequest;
        uint256 lastMinuteReset;
    }
    
    mapping(bytes32 => APIKey) public apiKeys;
    mapping(address => bytes32[]) public userAPIKeys;
    mapping(bytes32 => APIUsage) public apiUsage;
    
    uint256 public constant RATE_LIMIT_WINDOW = 1 minutes;
    
    // Rate limits per tier
    mapping(APITier => uint256) public tierRateLimits;
    
    event APIKeyCreated(
        bytes32 indexed keyHash,
        address indexed owner,
        APITier tier,
        string description,
        uint256 expiryDate,
        uint256 timestamp
    );
    
    event APIKeyRevoked(
        bytes32 indexed keyHash,
        address revokedBy,
        uint256 timestamp
    );
    
    event APIRequest(
        bytes32 indexed keyHash,
        address indexed requester,
        string endpoint,
        uint256 timestamp
    );

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(API_MANAGER_ROLE, msg.sender);
        
        // Initialize tier rate limits
        tierRateLimits[APITier.FREE] = 60; // 60 RPM
        tierRateLimits[APITier.DEVELOPER] = 300; // 300 RPM
        tierRateLimits[APITier.ENTERPRISE] = 1000; // 1000 RPM
        tierRateLimits[APITier.PARTNER] = 5000; // 5000 RPM
    }

    function createAPIKey(
        APITier tier,
        string memory description,
        uint256 duration
    ) public returns (bytes32) {
        bytes32 key = keccak256(abi.encodePacked(msg.sender, block.timestamp, description));
        bytes32 keyHash = keccak256(abi.encodePacked(key));
        
        uint256 expiryDate = duration > 0 ? block.timestamp + duration : type(uint256).max;
        
        apiKeys[keyHash] = APIKey({
            keyHash: keyHash,
            owner: msg.sender,
            tier: tier,
            rateLimit: tierRateLimits[tier],
            totalRequests: 0,
            lastReset: block.timestamp,
            isActive: true,
            description: description,
            createdDate: block.timestamp,
            expiryDate: expiryDate
        });
        
        userAPIKeys[msg.sender].push(keyHash);
        
        emit APIKeyCreated(keyHash, msg.sender, tier, description, expiryDate, block.timestamp);
        
        return key; // Return the actual key (not hash)
    }

    function validateAPIKey(
        bytes32 apiKey,
        string memory endpoint
    ) public returns (bool, string memory) {
        bytes32 keyHash = keccak256(abi.encodePacked(apiKey));
        APIKey storage apiKeyData = apiKeys[keyHash];
        
        if (!apiKeyData.isActive) {
            return (false, "API key is inactive");
        }
        
        if (apiKeyData.expiryDate < block.timestamp) {
            return (false, "API key has expired");
        }
        
        // Check rate limiting
        APIUsage storage usage = apiUsage[keyHash];
        
        // Reset counter if new minute
        if (block.timestamp >= usage.lastMinuteReset + RATE_LIMIT_WINDOW) {
            usage.thisMinute = 0;
            usage.lastMinuteReset = block.timestamp;
        }
        
        if (usage.thisMinute >= apiKeyData.rateLimit) {
            return (false, "Rate limit exceeded");
        }
        
        // Update usage
        usage.thisMinute++;
        usage.totalRequests++;
        usage.lastRequest = block.timestamp;
        
        apiKeyData.totalRequests++;
        
        emit APIRequest(keyHash, msg.sender, endpoint, block.timestamp);
        
        return (true, "API key valid");
    }

    function revokeAPIKey(bytes32 keyHash) public {
        APIKey storage apiKey = apiKeys[keyHash];
        require(apiKey.owner == msg.sender || hasRole(API_MANAGER_ROLE, msg.sender), 
                "Not authorized to revoke");
        
        apiKey.isActive = false;
        
        emit APIKeyRevoked(keyHash, msg.sender, block.timestamp);
    }

    function updateAPITier(
        bytes32 keyHash,
        APITier newTier
    ) public onlyRole(API_MANAGER_ROLE) {
        APIKey storage apiKey = apiKeys[keyHash];
        require(apiKey.isActive, "API key not active");
        
        apiKey.tier = newTier;
        apiKey.rateLimit = tierRateLimits[newTier];
    }

    function extendAPIKey(
        bytes32 keyHash,
        uint256 additionalDuration
    ) public {
        APIKey storage apiKey = apiKeys[keyHash];
        require(apiKey.owner == msg.sender, "Not API key owner");
        require(apiKey.isActive, "API key not active");
        
        if (apiKey.expiryDate < block.timestamp) {
            apiKey.expiryDate = block.timestamp + additionalDuration;
        } else {
            apiKey.expiryDate += additionalDuration;
        }
    }

    function getUserAPIKeys(address user) public view returns (bytes32[] memory) {
        return userAPIKeys[user];
    }

    function getAPIKeyUsage(bytes32 keyHash) public view returns (APIUsage memory) {
        return apiUsage[keyHash];
    }

    function setTierRateLimit(APITier tier, uint256 newLimit) public onlyRole(API_MANAGER_ROLE) {
        tierRateLimits[tier] = newLimit;
        
        // Update existing keys of this tier
        // This would iterate through all keys in production
    }

    function getActiveKeysCount() public view returns (uint256) {
        uint256 count = 0;
        // This would iterate through all keys in production
        return count;
    }

    function emergencyRevokeAllKeys() public onlyRole(DEFAULT_ADMIN_ROLE) {
        // This would deactivate all keys in an emergency
        // Implementation would iterate through all keys
    }
}