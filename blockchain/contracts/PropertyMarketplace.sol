// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./DeedNFT.sol";
import "./TokenizationManager.sol";

/**
 * @title PropertyMarketplace
 * @dev Marketplace for trading property NFTs and fractional shares
 */
contract PropertyMarketplace is AccessControl, ReentrancyGuard {
    bytes32 public constant MARKETPLACE_MANAGER_ROLE = keccak256("MARKETPLACE_MANAGER_ROLE");
    
    DeedNFT public deedNFT;
    TokenizationManager public tokenizationManager;
    IERC20 public deedToken;
    
    uint256 public constant PLATFORM_FEE = 25; // 0.25%
    address public feeRecipient;
    
    enum ListingType { FIXED_PRICE, AUCTION }
    enum AssetType { FULL_PROPERTY, FRACTIONAL_SHARES }
    
    struct Listing {
        uint256 listingId;
        address seller;
        AssetType assetType;
        ListingType listingType;
        uint256 assetId; // propertyId for full, token address for fractional
        uint256 quantity; // 1 for full property, amount for fractional
        uint256 price;
        uint256 startTime;
        uint256 endTime;
        bool active;
        address highestBidder;
        uint256 highestBid;
    }
    
    mapping(uint256 => Listing) public listings;
    mapping(uint256 => mapping(address => uint256)) public bids;
    mapping(address => uint256[]) public userListings;
    
    uint256 public listingCounter;
    
    event ListingCreated(
        uint256 indexed listingId,
        address indexed seller,
        AssetType assetType,
        ListingType listingType,
        uint256 assetId,
        uint256 quantity,
        uint256 price,
        uint256 endTime
    );
    
    event ListingSold(
        uint256 indexed listingId,
        address indexed seller,
        address indexed buyer,
        uint256 price,
        uint256 fee,
        uint256 timestamp
    );
    
    event ListingCancelled(
        uint256 indexed listingId,
        address indexed seller,
        uint256 timestamp
    );

    constructor(
        address _deedNFT,
        address _tokenizationManager,
        address _deedToken,
        address _feeRecipient
    ) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MARKETPLACE_MANAGER_ROLE, msg.sender);
        
        deedNFT = DeedNFT(_deedNFT);
        tokenizationManager = TokenizationManager(_tokenizationManager);
        deedToken = IERC20(_deedToken);
        feeRecipient = _feeRecipient;
    }

    function createListing(
        AssetType assetType,
        ListingType listingType,
        uint256 assetId,
        uint256 quantity,
        uint256 price,
        uint256 duration
    ) public returns (uint256) {
        require(price > 0, "Price must be greater than 0");
        require(duration <= 30 days, "Duration too long");
        
        if (assetType == AssetType.FULL_PROPERTY) {
            require(deedNFT.ownerOf(assetId) == msg.sender, "Not property owner");
            require(quantity == 1, "Invalid quantity for full property");
            require(deedNFT.getPropertyInfo(assetId).isVerified, "Property not verified");
            
            // Transfer NFT to marketplace
            deedNFT.transferFrom(msg.sender, address(this), assetId);
        } else {
            // For fractional shares
            IERC20 fractionalToken = IERC20(address(uint160(assetId)));
            require(fractionalToken.balanceOf(msg.sender) >= quantity, "Insufficient shares");
            require(fractionalToken.allowance(msg.sender, address(this)) >= quantity, "Insufficient allowance");
            
            // Transfer shares to marketplace
            fractionalToken.transferFrom(msg.sender, address(this), quantity);
        }
        
        listingCounter++;
        
        listings[listingCounter] = Listing({
            listingId: listingCounter,
            seller: msg.sender,
            assetType: assetType,
            listingType: listingType,
            assetId: assetId,
            quantity: quantity,
            price: price,
            startTime: block.timestamp,
            endTime: block.timestamp + duration,
            active: true,
            highestBidder: address(0),
            highestBid: 0
        });
        
        userListings[msg.sender].push(listingCounter);
        
        emit ListingCreated(
            listingCounter,
            msg.sender,
            assetType,
            listingType,
            assetId,
            quantity,
            price,
            block.timestamp + duration
        );
        
        return listingCounter;
    }

    function purchaseListing(uint256 listingId) public nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(listing.listingType == ListingType.FIXED_PRICE, "Not fixed price listing");
        require(block.timestamp <= listing.endTime, "Listing expired");
        require(deedToken.transferFrom(msg.sender, address(this), listing.price), "Payment failed");
        
        _executeSale(listingId, msg.sender, listing.price);
    }

    function placeBid(uint256 listingId, uint256 bidAmount) public nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(listing.listingType == ListingType.AUCTION, "Not auction listing");
        require(block.timestamp <= listing.endTime, "Auction ended");
        require(bidAmount > listing.highestBid, "Bid too low");
        require(bidAmount >= listing.price, "Bid below reserve");
        
        // Return previous bid if any
        if (listing.highestBidder != address(0)) {
            require(deedToken.transfer(listing.highestBidder, listing.highestBid), "Refund failed");
        }
        
        require(deedToken.transferFrom(msg.sender, address(this), bidAmount), "Bid transfer failed");
        
        listing.highestBidder = msg.sender;
        listing.highestBid = bidAmount;
        bids[listingId][msg.sender] = bidAmount;
    }

    function finalizeAuction(uint256 listingId) public nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(listing.listingType == ListingType.AUCTION, "Not auction listing");
        require(block.timestamp > listing.endTime, "Auction not ended");
        require(listing.highestBidder != address(0), "No bids placed");
        
        _executeSale(listingId, listing.highestBidder, listing.highestBid);
    }

    function _executeSale(uint256 listingId, address buyer, uint256 price) internal {
        Listing storage listing = listings[listingId];
        
        // Calculate fees
        uint256 fee = (price * PLATFORM_FEE) / 10000;
        uint256 sellerProceeds = price - fee;
        
        // Transfer payment
        require(deedToken.transfer(feeRecipient, fee), "Fee transfer failed");
        require(deedToken.transfer(listing.seller, sellerProceeds), "Payment to seller failed");
        
        // Transfer asset
        if (listing.assetType == AssetType.FULL_PROPERTY) {
            deedNFT.transferFrom(address(this), buyer, listing.assetId);
        } else {
            IERC20 fractionalToken = IERC20(address(uint160(listing.assetId)));
            fractionalToken.transfer(buyer, listing.quantity);
        }
        
        listing.active = false;
        
        emit ListingSold(listingId, listing.seller, buyer, price, fee, block.timestamp);
    }

    function cancelListing(uint256 listingId) public nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.seller == msg.sender, "Not listing owner");
        require(listing.active, "Listing not active");
        require(listing.highestBidder == address(0), "Cannot cancel with active bids");
        
        // Return asset to seller
        if (listing.assetType == AssetType.FULL_PROPERTY) {
            deedNFT.transferFrom(address(this), msg.sender, listing.assetId);
        } else {
            IERC20 fractionalToken = IERC20(address(uint160(listing.assetId)));
            fractionalToken.transfer(msg.sender, listing.quantity);
        }
        
        listing.active = false;
        
        emit ListingCancelled(listingId, msg.sender, block.timestamp);
    }

    function getUserListings(address user) public view returns (uint256[] memory) {
        return userListings[user];
    }

    function getActiveListings() public view returns (uint256[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 1; i <= listingCounter; i++) {
            if (listings[i].active) {
                activeCount++;
            }
        }
        
        uint256[] memory activeListings = new uint256[](activeCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 1; i <= listingCounter; i++) {
            if (listings[i].active) {
                activeListings[currentIndex] = i;
                currentIndex++;
            }
        }
        
        return activeListings;
    }
}