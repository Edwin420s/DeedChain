// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

/**
 * @title DeedChainOracle
 * @dev Central oracle service for DeedChain providing various data feeds
 */
contract DeedChainOracle is AccessControl {
    bytes32 public constant ORACLE_MANAGER_ROLE = keccak256("ORACLE_MANAGER_ROLE");
    bytes32 public constant DATA_PROVIDER_ROLE = keccak256("DATA_PROVIDER_ROLE");
    
    // Chainlink Price Feeds
    AggregatorV3Interface public ethUsdPriceFeed;
    AggregatorV3Interface public maticUsdPriceFeed;
    
    // Custom data feeds
    struct AreaPriceData {
        string areaCode;
        uint256 pricePerSqm; // in USD (8 decimals)
        uint256 timestamp;
        uint256 confidence; // 0-100 confidence score
    }
    
    struct EconomicData {
        uint256 interestRate; // in basis points (100 = 1%)
        uint256 inflationRate; // in basis points
        uint256 gdpGrowth; // in basis points
        uint256 timestamp;
    }
    
    mapping(string => AreaPriceData[]) public areaPriceHistory;
    mapping(string => uint256) public currentAreaPrices;
    EconomicData public currentEconomicData;
    
    event AreaPriceUpdated(
        string areaCode,
        uint256 pricePerSqm,
        uint256 confidence,
        uint256 timestamp
    );
    
    event EconomicDataUpdated(
        uint256 interestRate,
        uint256 inflationRate,
        uint256 gdpGrowth,
        uint256 timestamp
    );

    constructor(
        address _ethUsdPriceFeed,
        address _maticUsdPriceFeed
    ) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ORACLE_MANAGER_ROLE, msg.sender);
        _grantRole(DATA_PROVIDER_ROLE, msg.sender);
        
        ethUsdPriceFeed = AggregatorV3Interface(_ethUsdPriceFeed);
        maticUsdPriceFeed = AggregatorV3Interface(_maticUsdPriceFeed);
    }

    function updateAreaPrice(
        string memory areaCode,
        uint256 pricePerSqm,
        uint256 confidence
    ) public onlyRole(DATA_PROVIDER_ROLE) {
        require(pricePerSqm > 0, "Invalid price");
        require(confidence <= 100, "Confidence must be <= 100");
        
        AreaPriceData memory newData = AreaPriceData({
            areaCode: areaCode,
            pricePerSqm: pricePerSqm,
            timestamp: block.timestamp,
            confidence: confidence
        });
        
        areaPriceHistory[areaCode].push(newData);
        currentAreaPrices[areaCode] = pricePerSqm;
        
        emit AreaPriceUpdated(areaCode, pricePerSqm, confidence, block.timestamp);
    }

    function updateEconomicData(
        uint256 interestRate,
        uint256 inflationRate,
        uint256 gdpGrowth
    ) public onlyRole(DATA_PROVIDER_ROLE) {
        currentEconomicData = EconomicData({
            interestRate: interestRate,
            inflationRate: inflationRate,
            gdpGrowth: gdpGrowth,
            timestamp: block.timestamp
        });
        
        emit EconomicDataUpdated(interestRate, inflationRate, gdpGrowth, block.timestamp);
    }

    function getETHPrice() public view returns (uint256) {
        (, int256 price, , , ) = ethUsdPriceFeed.latestRoundData();
        require(price > 0, "Invalid price feed");
        return uint256(price);
    }

    function getMATICPrice() public view returns (uint256) {
        (, int256 price, , , ) = maticUsdPriceFeed.latestRoundData();
        require(price > 0, "Invalid price feed");
        return uint256(price);
    }

    function getAreaPrice(string memory areaCode) public view returns (uint256) {
        return currentAreaPrices[areaCode];
    }

    function getAreaPriceHistory(string memory areaCode) public view returns (AreaPriceData[] memory) {
        return areaPriceHistory[areaCode];
    }

    function calculatePropertyValuation(
        uint256 areaSize,
        string memory areaCode
    ) public view returns (uint256) {
        uint256 pricePerSqm = currentAreaPrices[areaCode];
        require(pricePerSqm > 0, "No price data for area");
        
        return areaSize * pricePerSqm;
    }

    function getMarketSentiment(string memory areaCode) public view returns (string memory) {
        AreaPriceData[] memory history = areaPriceHistory[areaCode];
        if (history.length < 2) {
            return "NEUTRAL";
        }
        
        uint256 currentPrice = history[history.length - 1].pricePerSqm;
        uint256 previousPrice = history[history.length - 2].pricePerSqm;
        
        if (currentPrice > previousPrice * 105 / 100) { // 5% increase
            return "BULLISH";
        } else if (currentPrice < previousPrice * 95 / 100) { // 5% decrease
            return "BEARISH";
        } else {
            return "NEUTRAL";
        }
    }

    function convertUSDToETH(uint256 usdAmount) public view returns (uint256) {
        uint256 ethPrice = getETHPrice();
        return (usdAmount * 1e18) / ethPrice;
    }

    function convertETHToUSD(uint256 ethAmount) public view returns (uint256) {
        uint256 ethPrice = getETHPrice();
        return (ethAmount * ethPrice) / 1e18;
    }

    // Batch operations for efficiency
    function updateMultipleAreaPrices(
        string[] memory areaCodes,
        uint256[] memory prices,
        uint256[] memory confidences
    ) public onlyRole(DATA_PROVIDER_ROLE) {
        require(areaCodes.length == prices.length, "Arrays length mismatch");
        require(areaCodes.length == confidences.length, "Arrays length mismatch");
        
        for (uint256 i = 0; i < areaCodes.length; i++) {
            updateAreaPrice(areaCodes[i], prices[i], confidences[i]);
        }
    }
}