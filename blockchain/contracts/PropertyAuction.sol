// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./DeedNFT.sol";

/**
 * @title PropertyAuction
 * @dev Auction system for property sales and fractional shares
 */
contract PropertyAuction is AccessControl, ReentrancyGuard {
    bytes32 public constant AUCTION_MANAGER_ROLE = keccak256("AUCTION_MANAGER_ROLE");
    
    DeedNFT public deedNFT;
    
    enum AuctionType { FULL_PROPERTY, FRACTIONAL_SHARES }
    enum AuctionStatus { ACTIVE, ENDED, CANCELLED }
    
    struct Auction {
        uint256 auctionId;
        address seller;
        uint256 propertyId;
        AuctionType auctionType;
        AuctionStatus status;
        uint256 startPrice;
        uint256 reservePrice;
        uint256 startTime;
        uint256 endTime;
        address highestBidder;
        uint256 highestBid;
        uint256 minBidIncrement;
        address fractionalToken; // For fractional auctions
        uint256 sharesAmount; // For fractional auctions
    }
    
    mapping(uint256 => Auction) public auctions;
    mapping(uint256 => mapping(address => uint256)) public bids;
    mapping(uint256 => address[]) public bidders;
    
    uint256 public auctionCounter;
    uint256 public constant AUCTION_DURATION = 7 days;
    
    event AuctionCreated(
        uint256 indexed auctionId,
        uint256 indexed propertyId,
        address indexed seller,
        AuctionType auctionType,
        uint256 startPrice,
        uint256 endTime
    );
    
    event BidPlaced(
        uint256 indexed auctionId,
        address indexed bidder,
        uint256 amount,
        uint256 timestamp
    );
    
    event AuctionEnded(
        uint256 indexed auctionId,
        address indexed winner,
        uint256 winningBid,
        uint256 timestamp
    );

    constructor(address deedNFTAddress) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(AUCTION_MANAGER_ROLE, msg.sender);
        deedNFT = DeedNFT(deedNFTAddress);
    }

    function createAuction(
        uint256 propertyId,
        AuctionType auctionType,
        uint256 startPrice,
        uint256 reservePrice,
        address fractionalToken,
        uint256 sharesAmount
    ) public returns (uint256) {
        require(deedNFT.ownerOf(propertyId) == msg.sender, "Not property owner");
        require(deedNFT.getPropertyInfo(propertyId).isVerified, "Property not verified");
        require(startPrice > 0, "Invalid start price");
        
        auctionCounter++;
        
        auctions[auctionCounter] = Auction({
            auctionId: auctionCounter,
            seller: msg.sender,
            propertyId: propertyId,
            auctionType: auctionType,
            status: AuctionStatus.ACTIVE,
            startPrice: startPrice,
            reservePrice: reservePrice,
            startTime: block.timestamp,
            endTime: block.timestamp + AUCTION_DURATION,
            highestBidder: address(0),
            highestBid: 0,
            minBidIncrement: startPrice / 20, // 5% min increment
            fractionalToken: fractionalToken,
            sharesAmount: sharesAmount
        });
        
        // Transfer NFT to auction contract for full property auctions
        if (auctionType == AuctionType.FULL_PROPERTY) {
            deedNFT.transferFrom(msg.sender, address(this), propertyId);
        }
        
        emit AuctionCreated(auctionCounter, propertyId, msg.sender, auctionType, startPrice, block.timestamp + AUCTION_DURATION);
        return auctionCounter;
    }

    function placeBid(uint256 auctionId) public payable nonReentrant {
        Auction storage auction = auctions[auctionId];
        require(auction.status == AuctionStatus.ACTIVE, "Auction not active");
        require(block.timestamp < auction.endTime, "Auction ended");
        require(msg.value >= auction.startPrice, "Bid below start price");
        require(msg.value >= auction.highestBid + auction.minBidIncrement, "Bid too low");
        
        // Return previous highest bidder's funds
        if (auction.highestBidder != address(0)) {
            payable(auction.highestBidder).transfer(auction.highestBid);
        }
        
        auction.highestBidder = msg.sender;
        auction.highestBid = msg.value;
        
        // Track bidder
        if (bids[auctionId][msg.sender] == 0) {
            bidders[auctionId].push(msg.sender);
        }
        bids[auctionId][msg.sender] += msg.value;
        
        emit BidPlaced(auctionId, msg.sender, msg.value, block.timestamp);
    }

    function endAuction(uint256 auctionId) public nonReentrant {
        Auction storage auction = auctions[auctionId];
        require(auction.status == AuctionStatus.ACTIVE, "Auction not active");
        require(block.timestamp >= auction.endTime, "Auction not ended");
        
        auction.status = AuctionStatus.ENDED;
        
        if (auction.highestBid >= auction.reservePrice && auction.highestBidder != address(0)) {
            // Successful auction
            if (auction.auctionType == AuctionType.FULL_PROPERTY) {
                // Transfer NFT to winner
                deedNFT.transferFrom(address(this), auction.highestBidder, auction.propertyId);
            } else {
                // For fractional auctions, transfer shares (implementation depends on token)
                // This would require integration with TokenizationManager
            }
            
            // Transfer funds to seller
            payable(auction.seller).transfer(auction.highestBid);
        } else {
            // Auction failed, return NFT to seller
            if (auction.auctionType == AuctionType.FULL_PROPERTY) {
                deedNFT.transferFrom(address(this), auction.seller, auction.propertyId);
            }
            // Return bids to bidders
            for (uint256 i = 0; i < bidders[auctionId].length; i++) {
                address bidder = bidders[auctionId][i];
                uint256 bidAmount = bids[auctionId][bidder];
                if (bidAmount > 0) {
                    payable(bidder).transfer(bidAmount);
                    bids[auctionId][bidder] = 0;
                }
            }
        }
        
        emit AuctionEnded(auctionId, auction.highestBidder, auction.highestBid, block.timestamp);
    }

    function getAuctionBidders(uint256 auctionId) public view returns (address[] memory) {
        return bidders[auctionId];
    }

    function getBidderAmount(uint256 auctionId, address bidder) public view returns (uint256) {
        return bids[auctionId][bidder];
    }
}