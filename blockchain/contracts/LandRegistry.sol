// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./DeedNFT.sol";

/**
 * @title LandRegistry
 * @dev Main registry contract for managing land deeds and verification process
 */
contract LandRegistry is AccessControl {
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");
    
    DeedNFT public deedNFT;
    
    // Property registration structure
    struct PropertyRegistration {
        uint256 tokenId;
        address owner;
        string ipfsHash;
        string location;
        uint256 areaSize;
        bool verified;
        uint256 registeredAt;
        uint256 verifiedAt;
    }
    
    // Mapping from token ID to registration details
    mapping(uint256 => PropertyRegistration) public propertyRegistrations;
    
    // Mapping from coordinates to token ID (simplified string representation)
    mapping(string => uint256) public coordinatesToTokenId;
    
    // Events
    event PropertyRegistered(
        uint256 indexed tokenId,
        address indexed owner,
        string ipfsHash,
        string location,
        uint256 areaSize,
        uint256 registeredAt
    );
    
    event PropertyVerified(
        uint256 indexed tokenId,
        address indexed verifier,
        uint256 verifiedAt
    );
    
    event OwnershipTransferred(
        uint256 indexed tokenId,
        address indexed previousOwner,
        address indexed newOwner,
        uint256 transferredAt
    );

    constructor(address deedNFTAddress) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(REGISTRAR_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
        
        deedNFT = DeedNFT(deedNFTAddress);
    }

    /**
     * @dev Register a new property and mint deed NFT
     * @param ipfsHash IPFS hash containing property metadata
     * @param location Physical location description
     * @param areaSize Size of the land in square meters
     * @param coordinates Geographic coordinates string
     */
    function registerProperty(
        string memory ipfsHash,
        string memory location,
        uint256 areaSize,
        string memory coordinates
    ) external onlyRole(REGISTRAR_ROLE) returns (uint256) {
        require(bytes(ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(bytes(coordinates).length > 0, "Coordinates cannot be empty");
        require(coordinatesToTokenId[coordinates] == 0, "Property already registered at these coordinates");
        
        // Mint new deed NFT
        uint256 tokenId = deedNFT.mintDeed(
            msg.sender, // Initial owner is the registrar
            ipfsHash,
            location,
            areaSize
        );
        
        // Store registration details
        propertyRegistrations[tokenId] = PropertyRegistration({
            tokenId: tokenId,
            owner: msg.sender,
            ipfsHash: ipfsHash,
            location: location,
            areaSize: areaSize,
            verified: false,
            registeredAt: block.timestamp,
            verifiedAt: 0
        });
        
        coordinatesToTokenId[coordinates] = tokenId;
        
        emit PropertyRegistered(
            tokenId,
            msg.sender,
            ipfsHash,
            location,
            areaSize,
            block.timestamp
        );
        
        return tokenId;
    }

    /**
     * @dev Verify a property (only verifiers can call this)
     * @param tokenId The token ID to verify
     */
    function verifyProperty(uint256 tokenId) external onlyRole(VERIFIER_ROLE) {
        require(propertyRegistrations[tokenId].tokenId != 0, "Property not registered");
        require(!propertyRegistrations[tokenId].verified, "Property already verified");
        
        // Verify the deed NFT
        deedNFT.verifyDeed(tokenId);
        
        // Update registration status
        propertyRegistrations[tokenId].verified = true;
        propertyRegistrations[tokenId].verifiedAt = block.timestamp;
        
        emit PropertyVerified(tokenId, msg.sender, block.timestamp);
    }

    /**
     * @dev Transfer property ownership
     * @param tokenId The token ID to transfer
     * @param to The new owner address
     */
    function transferOwnership(
        uint256 tokenId,
        address to
    ) external {
        require(propertyRegistrations[tokenId].tokenId != 0, "Property not registered");
        require(propertyRegistrations[tokenId].verified, "Cannot transfer unverified property");
        require(deedNFT.ownerOf(tokenId) == msg.sender, "Not the owner of this property");
        
        address previousOwner = propertyRegistrations[tokenId].owner;
        
        // Transfer the NFT
        deedNFT.transferFrom(msg.sender, to, tokenId);
        
        // Update registration owner
        propertyRegistrations[tokenId].owner = to;
        
        emit OwnershipTransferred(tokenId, previousOwner, to, block.timestamp);
    }

    /**
     * @dev Get property registration details
     * @param tokenId The token ID to query
     */
    function getProperty(uint256 tokenId) external view returns (PropertyRegistration memory) {
        require(propertyRegistrations[tokenId].tokenId != 0, "Property not registered");
        return propertyRegistrations[tokenId];
    }

    /**
     * @dev Check if property is verified
     * @param tokenId The token ID to check
     */
    function isPropertyVerified(uint256 tokenId) external view returns (bool) {
        require(propertyRegistrations[tokenId].tokenId != 0, "Property not registered");
        return propertyRegistrations[tokenId].verified;
    }

    /**
     * @dev Get token ID by coordinates
     * @param coordinates The coordinates to search
     */
    function getTokenIdByCoordinates(string memory coordinates) external view returns (uint256) {
        return coordinatesToTokenId[coordinates];
    }

    /**
     * @dev Get total number of registered properties
     */
    function totalProperties() external view returns (uint256) {
        return deedNFT.totalDeeds();
    }
}