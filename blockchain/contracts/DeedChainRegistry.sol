// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./DeedNFT.sol";
import "./LandRegistry.sol";
import "./TokenizationManager.sol";
import "./DAOVerification.sol";
import "./PropertyMarketplace.sol";
import "./DisputeResolution.sol";
import "./DeedChainTreasury.sol";

/**
 * @title DeedChainRegistry
 * @dev Main registry contract that coordinates all DeedChain modules
 * Acts as the central hub for the entire DeedChain ecosystem
 */
contract DeedChainRegistry is AccessControl {
    bytes32 public constant REGISTRY_MANAGER_ROLE = keccak256("REGISTRY_MANAGER_ROLE");
    
    // Core Contracts
    DeedNFT public deedNFT;
    LandRegistry public landRegistry;
    TokenizationManager public tokenizationManager;
    DAOVerification public daoVerification;
    
    // Additional Modules
    PropertyMarketplace public propertyMarketplace;
    DisputeResolution public disputeResolution;
    DeedChainTreasury public deedChainTreasury;
    
    // System Statistics
    struct SystemStats {
        uint256 totalProperties;
        uint256 verifiedProperties;
        uint256 tokenizedProperties;
        uint256 totalTransfers;
        uint256 activeListings;
        uint256 activeDisputes;
        uint256 totalRevenue;
    }
    
    // Events
    event SystemInitialized(
        address indexed deployer,
        address deedNFT,
        address landRegistry,
        address tokenizationManager,
        address daoVerification,
        uint256 timestamp
    );
    
    event ModuleAdded(
        string moduleName,
        address moduleAddress,
        uint256 timestamp
    );
    
    event PropertyLifecycle(
        uint256 indexed propertyId,
        string action,
        address indexed actor,
        uint256 timestamp
    );

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(REGISTRY_MANAGER_ROLE, msg.sender);
    }

    function initializeSystem(
        address _deedNFT,
        address _landRegistry,
        address _tokenizationManager,
        address _daoVerification
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        deedNFT = DeedNFT(_deedNFT);
        landRegistry = LandRegistry(_landRegistry);
        tokenizationManager = TokenizationManager(_tokenizationManager);
        daoVerification = DAOVerification(_daoVerification);
        
        emit SystemInitialized(
            msg.sender,
            _deedNFT,
            _landRegistry,
            _tokenizationManager,
            _daoVerification,
            block.timestamp
        );
    }

    function addMarketplaceModule(address _propertyMarketplace) public onlyRole(REGISTRY_MANAGER_ROLE) {
        propertyMarketplace = PropertyMarketplace(_propertyMarketplace);
        emit ModuleAdded("PropertyMarketplace", _propertyMarketplace, block.timestamp);
    }

    function addDisputeResolutionModule(address _disputeResolution) public onlyRole(REGISTRY_MANAGER_ROLE) {
        disputeResolution = DisputeResolution(_disputeResolution);
        emit ModuleAdded("DisputeResolution", _disputeResolution, block.timestamp);
    }

    function addTreasuryModule(address _deedChainTreasury) public onlyRole(REGISTRY_MANAGER_ROLE) {
        deedChainTreasury = DeedChainTreasury(_deedChainTreasury);
        emit ModuleAdded("DeedChainTreasury", _deedChainTreasury, block.timestamp);
    }

    function registerProperty(
        address to,
        string memory ipfsHash,
        string memory geoCoordinates,
        uint256 areaSize,
        string memory surveyNumber
    ) public onlyRole(REGISTRY_MANAGER_ROLE) returns (uint256) {
        uint256 tokenId = deedNFT.registerProperty(to, ipfsHash, geoCoordinates, areaSize, surveyNumber);
        
        emit PropertyLifecycle(tokenId, "REGISTERED", msg.sender, block.timestamp);
        return tokenId;
    }

    function proposeVerification(uint256 propertyId) public onlyRole(REGISTRY_MANAGER_ROLE) {
        daoVerification.proposeVerification(propertyId);
        emit PropertyLifecycle(propertyId, "VERIFICATION_PROPOSED", msg.sender, block.timestamp);
    }

    function getSystemStats() public view returns (SystemStats memory) {
        // This would integrate with all modules to get real statistics
        // For now, returns a basic structure
        return SystemStats({
            totalProperties: 0, // Would be tracked
            verifiedProperties: 0,
            tokenizedProperties: 0,
            totalTransfers: 0,
            activeListings: 0,
            activeDisputes: 0,
            totalRevenue: 0
        });
    }

    function getPropertyFullStatus(uint256 propertyId) public view returns (
        bool exists,
        bool verified,
        bool tokenized,
        bool frozen,
        string memory status
    ) {
        if (!deedNFT.exists(propertyId)) {
            return (false, false, false, false, "NOT_EXISTS");
        }
        
        DeedNFT.PropertyInfo memory info = deedNFT.getPropertyInfo(propertyId);
        bool isFrozen = address(disputeResolution) != address(0) && 
                       disputeResolution.isPropertyFrozen(propertyId);
        
        string memory currentStatus;
        if (!info.isVerified) {
            currentStatus = "PENDING_VERIFICATION";
        } else if (info.isTokenized) {
            currentStatus = "TOKENIZED";
        } else if (isFrozen) {
            currentStatus = "FROZEN_DISPUTE";
        } else {
            currentStatus = "ACTIVE";
        }
        
        return (true, info.isVerified, info.isTokenized, isFrozen, currentStatus);
    }

    function isPropertyTransferable(uint256 propertyId) public view returns (bool, string memory) {
        (bool exists, bool verified, , bool frozen, string memory status) = getPropertyFullStatus(propertyId);
        
        if (!exists) return (false, "Property does not exist");
        if (!verified) return (false, "Property not verified");
        if (frozen) return (false, "Property frozen due to dispute");
        
        return (true, "Transferable");
    }

    // Emergency system functions
    function emergencyPauseSystem() public onlyRole(DEFAULT_ADMIN_ROLE) {
        // Would pause critical operations across all modules
        // Implementation depends on individual module pausability
    }

    function emergencyUnpauseSystem() public onlyRole(DEFAULT_ADMIN_ROLE) {
        // Would unpause system operations
    }

    function getContractAddresses() public view returns (
        address,
        address,
        address,
        address,
        address,
        address,
        address
    ) {
        return (
            address(deedNFT),
            address(landRegistry),
            address(tokenizationManager),
            address(daoVerification),
            address(propertyMarketplace),
            address(disputeResolution),
            address(deedChainTreasury)
        );
    }
}