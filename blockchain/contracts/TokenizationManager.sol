// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "./DeedNFT.sol";

/**
 * @title LandShareToken
 * @dev ERC20 token representing fractional ownership of a property
 */
contract LandShareToken is ERC20, AccessControl {
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    
    uint256 public immutable propertyId;
    address public immutable tokenizationManager;
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 _propertyId,
        address manager
    ) ERC20(name, symbol) {
        _grantRole(DEFAULT_ADMIN_ROLE, manager);
        _grantRole(MANAGER_ROLE, manager);
        propertyId = _propertyId;
        tokenizationManager = manager;
    }
    
    function mint(address to, uint256 amount) public onlyRole(MANAGER_ROLE) {
        _mint(to, amount);
    }
    
    function burn(address from, uint256 amount) public onlyRole(MANAGER_ROLE) {
        _burn(from, amount);
    }
}

/**
 * @title TokenizationManager
 * @dev Manages fractional ownership of properties through ERC20 tokens
 */
contract TokenizationManager is AccessControl, IERC721Receiver {
    bytes32 public constant TOKENIZER_ROLE = keccak256("TOKENIZER_ROLE");
    
    DeedNFT public deedNFT;
    
    struct TokenizedProperty {
        address landShareToken;
        uint256 totalShares;
        uint256 nftLockedTimestamp;
        bool isActive;
    }
    
    mapping(uint256 => TokenizedProperty) public tokenizedProperties;
    mapping(address => uint256) public tokenToProperty;
    
    event PropertyTokenized(
        uint256 indexed propertyId,
        address indexed landShareToken,
        string tokenName,
        string tokenSymbol,
        uint256 totalShares,
        address indexed tokenizer
    );
    
    event PropertyRedeemed(
        uint256 indexed propertyId,
        address indexed redeemer,
        uint256 timestamp
    );

    constructor(address deedNFTAddress) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(TOKENIZER_ROLE, msg.sender);
        deedNFT = DeedNFT(deedNFTAddress);
    }

    function tokenizeProperty(
        uint256 propertyId,
        string memory tokenName,
        string memory tokenSymbol,
        uint256 totalShares
    ) public onlyRole(TOKENIZER_ROLE) returns (address) {
        require(deedNFT.ownerOf(propertyId) == address(this), "NFT not locked in contract");
        require(!tokenizedProperties[propertyId].isActive, "Property already tokenized");
        require(deedNFT.getPropertyInfo(propertyId).isVerified, "Property not verified");
        
        LandShareToken landShareToken = new LandShareToken(
            tokenName,
            tokenSymbol,
            propertyId,
            address(this)
        );
        
        tokenizedProperties[propertyId] = TokenizedProperty({
            landShareToken: address(landShareToken),
            totalShares: totalShares,
            nftLockedTimestamp: block.timestamp,
            isActive: true
        });
        
        tokenToProperty[address(landShareToken)] = propertyId;
        
        // Mint initial shares to the contract for distribution
        landShareToken.mint(address(this), totalShares);

        // Mark property as tokenized in DeedNFT
        deedNFT.setTokenizedStatus(propertyId, true);
        
        emit PropertyTokenized(propertyId, address(landShareToken), tokenName, tokenSymbol, totalShares, msg.sender);
        return address(landShareToken);
    }

    function lockNFTForTokenization(uint256 propertyId) public {
        require(deedNFT.ownerOf(propertyId) == msg.sender, "Not property owner");
        require(!tokenizedProperties[propertyId].isActive, "Property already tokenized");
        
        deedNFT.safeTransferFrom(msg.sender, address(this), propertyId);
    }

    function distributeShares(
        uint256 propertyId,
        address[] memory recipients,
        uint256[] memory amounts
    ) public onlyRole(TOKENIZER_ROLE) {
        TokenizedProperty storage tProperty = tokenizedProperties[propertyId];
        require(tProperty.isActive, "Property not tokenized");
        
        LandShareToken landShareToken = LandShareToken(tProperty.landShareToken);
        
        for (uint256 i = 0; i < recipients.length; i++) {
            landShareToken.transfer(recipients[i], amounts[i]);
        }
    }

    function redeemProperty(uint256 propertyId) public {
        TokenizedProperty storage tProperty = tokenizedProperties[propertyId];
        require(tProperty.isActive, "Property not tokenized");
        
        LandShareToken landShareToken = LandShareToken(tProperty.landShareToken);
        uint256 userBalance = landShareToken.balanceOf(msg.sender);
        require(userBalance >= tProperty.totalShares, "Insufficient shares to redeem");
        
        // Burn all shares
        landShareToken.burn(msg.sender, userBalance);
        
        // Transfer NFT back to redeemer
        deedNFT.safeTransferFrom(address(this), msg.sender, propertyId);
        
        tProperty.isActive = false;

        // Mark property as no longer tokenized in DeedNFT
        deedNFT.setTokenizedStatus(propertyId, false);
        
        emit PropertyRedeemed(propertyId, msg.sender, block.timestamp);
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    function getTokenizedProperty(uint256 propertyId) public view returns (TokenizedProperty memory) {
        return tokenizedProperties[propertyId];
    }
}