// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./DeedNFT.sol";
import "./LandRegistry.sol";
import "./TokenizationManager.sol";
import "./DAOVerification.sol";

/**
 * @title PropertyRegistry
 * @dev Main registry contract that coordinates all DeedChain modules
 */
contract PropertyRegistry is AccessControl {
    bytes32 public constant REGISTRY_MANAGER_ROLE = keccak256("REGISTRY_MANAGER_ROLE");
    
    DeedNFT public deedNFT;
    LandRegistry public landRegistry;
    TokenizationManager public tokenizationManager;
    DAOVerification public daoVerification;
    
    struct SystemStats {
        uint256 totalProperties;
        uint256 verifiedProperties;
        uint256 tokenizedProperties;
        uint256 totalTransfers;
        uint256 activeValidators;
    }
    
    event SystemInitialized(
        address deedNFT,
        address landRegistry,
        address tokenizationManager,
        address daoVerification,
        uint256 timestamp
    );
    
    event PropertyLifecycle(
        uint256 indexed propertyId,
        string action,
        address indexed actor,
        uint256 timestamp
    );

    constructor(
        address _deedNFT,
        address _landRegistry,
        address _tokenizationManager,
        address _daoVerification
    ) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(REGISTRY_MANAGER_ROLE, msg.sender);
        
        deedNFT = DeedNFT(_deedNFT);
        landRegistry = LandRegistry(_landRegistry);
        tokenizationManager = TokenizationManager(_tokenizationManager);
        daoVerification = DAOVerification(_daoVerification);
        
        emit SystemInitialized(_deedNFT, _landRegistry, _tokenizationManager, _daoVerification, block.timestamp);
    }

    function registerPropertyWithVerification(
        address to,
        string memory ipfsHash,
        string memory geoCoordinates,
        uint256 areaSize,
        string memory surveyNumber
    ) public onlyRole(REGISTRY_MANAGER_ROLE) returns (uint256) {
        // Register property
        uint256 tokenId = deedNFT.registerProperty(to, ipfsHash, geoCoordinates, areaSize, surveyNumber);
        
        // Automatically propose verification
        daoVerification.proposeVerification(tokenId);
        
        emit PropertyLifecycle(tokenId, "REGISTERED_AND_PROPOSED", msg.sender, block.timestamp);
        return tokenId;
    }

    function getSystemStats() public view returns (SystemStats memory) {
        // This would require additional tracking, but provides structure
        return SystemStats({
            totalProperties: 0, // Would track in real implementation
            verifiedProperties: 0,
            tokenizedProperties: 0,
            totalTransfers: 0,
            activeValidators: 0
        });
    }

    function getPropertyStatus(uint256 propertyId) public view returns (string memory) {
        if (!deedNFT.exists(propertyId)) {
            return "NOT_EXISTS";
        }
        
        (bool isVerified, bool isTokenized) = getPropertyVerificationStatus(propertyId);
        
        if (!isVerified) {
            return "PENDING_VERIFICATION";
        } else if (isTokenized) {
            return "TOKENIZED";
        } else {
            return "VERIFIED_AND_ACTIVE";
        }
    }

    function getPropertyVerificationStatus(uint256 propertyId) public view returns (bool isVerified, bool isTokenized) {
        DeedNFT.PropertyInfo memory info = deedNFT.getPropertyInfo(propertyId);
        return (info.isVerified, info.isTokenized);
    }

    function exists(uint256 propertyId) public view returns (bool) {
        try deedNFT.ownerOf(propertyId) returns (address) {
            return true;
        } catch {
            return false;
        }
    }
}