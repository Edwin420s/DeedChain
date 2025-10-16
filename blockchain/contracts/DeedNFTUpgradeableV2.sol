// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DeedNFTUpgradeable.sol";

/**
 * @title DeedNFTUpgradeableV2
 * @dev Version 2 of upgradeable DeedNFT with additional features
 */
contract DeedNFTUpgradeableV2 is DeedNFTUpgradeable {
    // New storage layout (add new variables at the end)
    mapping(uint256 => string) public propertyImages;
    mapping(uint256 => uint256) public propertyValuations;
    
    string public version;
    
    // New events
    event PropertyImageUpdated(uint256 indexed tokenId, string imageHash, uint256 timestamp);
    event PropertyValuationUpdated(uint256 indexed tokenId, uint256 valuation, uint256 timestamp);
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    function initializeV2() public reinitializer(2) {
        version = "2.0.0";
    }
    
    function setPropertyImage(uint256 tokenId, string memory imageHash) public onlyRole(REGISTRAR_ROLE) {
        require(_exists(tokenId), "Property does not exist");
        propertyImages[tokenId] = imageHash;
        
        emit PropertyImageUpdated(tokenId, imageHash, block.timestamp);
    }
    
    function setPropertyValuation(uint256 tokenId, uint256 valuation) public onlyRole(REGISTRAR_ROLE) {
        require(_exists(tokenId), "Property does not exist");
        propertyValuations[tokenId] = valuation;
        
        emit PropertyValuationUpdated(tokenId, valuation, block.timestamp);
    }
    
    function getPropertyImage(uint256 tokenId) public view returns (string memory) {
        require(_exists(tokenId), "Property does not exist");
        return propertyImages[tokenId];
    }
    
    function getPropertyValuation(uint256 tokenId) public view returns (uint256) {
        require(_exists(tokenId), "Property does not exist");
        return propertyValuations[tokenId];
    }
    
    function getEnhancedPropertyInfo(uint256 tokenId) public view returns (
        PropertyInfo memory info,
        string memory image,
        uint256 valuation
    ) {
        require(_exists(tokenId), "Property does not exist");
        info = propertyInfo[tokenId];
        image = propertyImages[tokenId];
        valuation = propertyValuations[tokenId];
        
        return (info, image, valuation);
    }
    
    // Override to include new data
    function tokenURI(uint256 tokenId) 
        public 
        view 
        override 
        returns (string memory) 
    {
        // Enhanced URI with additional metadata
        return super.tokenURI(tokenId);
    }
}