// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./DeedNFT.sol";
import "./LandRegistry.sol";
import "./PropertyMarketplace.sol";

/**
 * @title PropertyAnalytics
 * @dev Tracks and provides analytics for property market data
 */
contract PropertyAnalytics is AccessControl {
    bytes32 public constant ANALYTICS_MANAGER_ROLE = keccak256("ANALYTICS_MANAGER_ROLE");
    
    DeedNFT public deedNFT;
    LandRegistry public landRegistry;
    PropertyMarketplace public propertyMarketplace;
    
    struct MarketStats {
        uint256 totalVolume;
        uint256 averagePrice;
        uint256 transactionsCount;
        uint256 activeListings;
        uint256 rentalYield;
    }
    
    struct PropertyHistory {
        uint256 propertyId;
        address[] previousOwners;
        uint256[] transferTimestamps;
        uint256[] salePrices;
        uint256 currentValuation;
    }
    
    struct AreaStats {
        string areaCode;
        uint256 totalProperties;
        uint256 averagePricePerSqm;
        uint256 totalVolume;
        uint256 growthRate;
    }
    
    mapping(uint256 => PropertyHistory) public propertyHistories;
    mapping(string => AreaStats) public areaStats;
    mapping(uint256 => uint256) public propertyValuationHistory;
    
    uint256[] public allTransactions;
    string[] public trackedAreas;
    
    event MarketDataUpdated(
        string areaCode,
        uint256 averagePrice,
        uint256 volume,
        uint256 growthRate,
        uint256 timestamp
    );
    
    event PropertyValuationUpdated(
        uint256 indexed propertyId,
        uint256 newValuation,
        uint256 timestamp
    );

    constructor(
        address _deedNFT,
        address _landRegistry,
        address _propertyMarketplace
    ) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ANALYTICS_MANAGER_ROLE, msg.sender);
        
        deedNFT = DeedNFT(_deedNFT);
        landRegistry = LandRegistry(_landRegistry);
        propertyMarketplace = PropertyMarketplace(_propertyMarketplace);
    }

    function recordPropertyTransfer(
        uint256 propertyId,
        address newOwner,
        uint256 salePrice
    ) public onlyRole(ANALYTICS_MANAGER_ROLE) {
        PropertyHistory storage history = propertyHistories[propertyId];
        
        // Add to ownership history
        history.previousOwners.push(newOwner);
        history.transferTimestamps.push(block.timestamp);
        
        if (salePrice > 0) {
            history.salePrices.push(salePrice);
            allTransactions.push(salePrice);
        }
        
        // Extract area code from property data (would need geo data integration)
        string memory areaCode = _extractAreaCode(propertyId);
        _updateAreaStats(areaCode, salePrice);
    }

    function updatePropertyValuation(uint256 propertyId, uint256 newValuation) 
        public 
        onlyRole(ANALYTICS_MANAGER_ROLE) 
    {
        propertyHistories[propertyId].currentValuation = newValuation;
        propertyValuationHistory[propertyId] = newValuation;
        
        emit PropertyValuationUpdated(propertyId, newValuation, block.timestamp);
    }

    function getMarketStats(string memory areaCode) public view returns (MarketStats memory) {
        AreaStats memory area = areaStats[areaCode];
        
        uint256 averagePrice = area.totalProperties > 0 ? 
            area.totalVolume / area.totalProperties : 0;
        
        uint256 rentalYield = _calculateRentalYield(areaCode);
        
        return MarketStats({
            totalVolume: area.totalVolume,
            averagePrice: averagePrice,
            transactionsCount: allTransactions.length,
            activeListings: _getActiveListingsCount(areaCode),
            rentalYield: rentalYield
        });
    }

    function getPropertyHistory(uint256 propertyId) public view returns (PropertyHistory memory) {
        return propertyHistories[propertyId];
    }

    function calculatePricePerSqm(uint256 propertyId) public view returns (uint256) {
        DeedNFT.PropertyInfo memory info = deedNFT.getPropertyInfo(propertyId);
        PropertyHistory memory history = propertyHistories[propertyId];
        
        if (info.areaSize == 0 || history.currentValuation == 0) {
            return 0;
        }
        
        return history.currentValuation / info.areaSize;
    }

    function getGrowthRate(string memory areaCode) public view returns (uint256) {
        return areaStats[areaCode].growthRate;
    }

    function getTopPerformingAreas(uint256 limit) public view returns (AreaStats[] memory) {
        uint256 resultCount = limit < trackedAreas.length ? limit : trackedAreas.length;
        AreaStats[] memory topAreas = new AreaStats[](resultCount);
        
        // This would implement sorting logic based on growth rate
        // Simplified implementation for now
        for (uint256 i = 0; i < resultCount; i++) {
            if (i < trackedAreas.length) {
                topAreas[i] = areaStats[trackedAreas[i]];
            }
        }
        
        return topAreas;
    }

    function _extractAreaCode(uint256 propertyId) internal view returns (string memory) {
        // This would extract area code from property coordinates or metadata
        // Simplified implementation - would integrate with geo-coding service
        DeedNFT.PropertyInfo memory info = deedNFT.getPropertyInfo(propertyId);
        return "DEFAULT_AREA"; // Placeholder
    }

    function _updateAreaStats(string memory areaCode, uint256 salePrice) internal {
        AreaStats storage area = areaStats[areaCode];
        
        if (area.totalProperties == 0) {
            // New area
            trackedAreas.push(areaCode);
            area.areaCode = areaCode;
        }
        
        area.totalProperties++;
        area.totalVolume += salePrice;
        
        // Calculate new average price per square meter
        // This would require more sophisticated calculation
        area.averagePricePerSqm = area.totalVolume / area.totalProperties;
        
        // Update growth rate (simplified)
        area.growthRate = _calculateGrowthRate(areaCode);
        
        emit MarketDataUpdated(
            areaCode,
            area.averagePricePerSqm,
            area.totalVolume,
            area.growthRate,
            block.timestamp
        );
    }

    function _calculateGrowthRate(string memory areaCode) internal view returns (uint256) {
        // Simplified growth rate calculation
        // In production, this would use historical data
        return 5; // 5% placeholder
    }

    function _calculateRentalYield(string memory areaCode) internal view returns (uint256) {
        // Simplified rental yield calculation
        // In production, this would use rental data
        return 7; // 7% placeholder
    }

    function _getActiveListingsCount(string memory areaCode) internal view returns (uint256) {
        // This would integrate with marketplace to get active listings by area
        return 0; // Placeholder
    }
}