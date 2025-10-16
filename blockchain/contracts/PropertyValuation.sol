// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

/**
 * @title PropertyValuation
 * @dev Oracle-based property valuation system using Chainlink
 */
contract PropertyValuation is AccessControl {
    bytes32 public constant VALUATOR_ROLE = keccak256("VALUATOR_ROLE");
    
    // Chainlink Price Feed (example: ETH/USD on Linea)
    AggregatorV3Interface public priceFeed;
    
    struct Valuation {
        uint256 propertyId;
        uint256 estimatedValue; // in USD (8 decimals)
        uint256 valuationDate;
        address valuator;
        string valuationMethod;
        bool isActive;
    }
    
    mapping(uint256 => Valuation[]) public propertyValuations;
    mapping(uint256 => uint256) public currentValuation;
    
    event PropertyValued(
        uint256 indexed propertyId,
        uint256 estimatedValue,
        address indexed valuator,
        uint256 timestamp,
        string valuationMethod
    );

    constructor(address chainlinkPriceFeed) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VALUATOR_ROLE, msg.sender);
        priceFeed = AggregatorV3Interface(chainlinkPriceFeed);
    }

    function addValuation(
        uint256 propertyId,
        uint256 estimatedValue,
        string memory valuationMethod
    ) public onlyRole(VALUATOR_ROLE) {
        require(estimatedValue > 0, "Invalid valuation amount");
        
        Valuation memory newValuation = Valuation({
            propertyId: propertyId,
            estimatedValue: estimatedValue,
            valuationDate: block.timestamp,
            valuator: msg.sender,
            valuationMethod: valuationMethod,
            isActive: true
        });
        
        propertyValuations[propertyId].push(newValuation);
        currentValuation[propertyId] = estimatedValue;
        
        emit PropertyValued(propertyId, estimatedValue, msg.sender, block.timestamp, valuationMethod);
    }

    function getLatestValuation(uint256 propertyId) public view returns (Valuation memory) {
        Valuation[] memory valuations = propertyValuations[propertyId];
        require(valuations.length > 0, "No valuations available");
        
        // Return the most recent active valuation
        for (uint256 i = valuations.length - 1; i >= 0; i--) {
            if (valuations[i].isActive) {
                return valuations[i];
            }
            if (i == 0) break; // Prevent underflow
        }
        
        revert("No active valuation found");
    }

    function getValuationHistory(uint256 propertyId) public view returns (Valuation[] memory) {
        return propertyValuations[propertyId];
    }

    function convertToETH(uint256 usdValue) public view returns (uint256) {
        (, int256 price, , , ) = priceFeed.latestRoundData();
        require(price > 0, "Invalid price feed");
        
        // price has 8 decimals, usdValue has 8 decimals
        return (usdValue * 1e18) / uint256(price);
    }

    function setValuationStatus(uint256 propertyId, uint256 valuationIndex, bool isActive) 
        public onlyRole(VALUATOR_ROLE) 
    {
        require(valuationIndex < propertyValuations[propertyId].length, "Invalid valuation index");
        propertyValuations[propertyId][valuationIndex].isActive = isActive;
    }
}