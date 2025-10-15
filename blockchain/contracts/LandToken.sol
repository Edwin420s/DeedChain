// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title LandToken
 * @dev ERC20 token for fractional ownership of land deeds
 */
contract LandToken is ERC20, ERC20Burnable, AccessControl, ReentrancyGuard {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    
    // Fractionalization structure
    struct Fractionalization {
        uint256 deedTokenId;
        address deedOwner;
        uint256 totalShares;
        bool active;
        uint256 fractionalizedAt;
    }
    
    // Mapping from deed token ID to fractionalization details
    mapping(uint256 => Fractionalization) public fractionalizations;
    
    // Events
    event LandFractionalized(
        uint256 indexed deedTokenId,
        address indexed owner,
        uint256 totalShares,
        string tokenName,
        string tokenSymbol,
        uint256 fractionalizedAt
    );
    
    event SharesRedeemed(
        uint256 indexed deedTokenId,
        address indexed redeemer,
        uint256 sharesAmount,
        uint256 redeemedAt
    );

    constructor() ERC20("DeedChain Land Share", "LANDSHARE") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(BURNER_ROLE, msg.sender);
    }

    /**
     * @dev Mint new shares for fractional ownership
     * @param to The address to receive the shares
     * @param amount The amount of shares to mint
     */
    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    /**
     * @dev Burn shares
     * @param amount The amount of shares to burn
     */
    function burn(uint256 amount) public override onlyRole(BURNER_ROLE) {
        _burn(msg.sender, amount);
    }

    /**
     * @dev Fractionalize a land deed into shares
     * @param deedTokenId The deed NFT token ID
     * @param totalShares Total number of shares to create
     * @param tokenName Name for the fractional token
     * @param tokenSymbol Symbol for the fractional token
     */
    function fractionalizeDeed(
        uint256 deedTokenId,
        uint256 totalShares,
        string memory tokenName,
        string memory tokenSymbol
    ) external onlyRole(MINTER_ROLE) returns (bool) {
        require(totalShares > 0, "Total shares must be greater than 0");
        require(!fractionalizations[deedTokenId].active, "Deed already fractionalized");
        
        fractionalizations[deedTokenId] = Fractionalization({
            deedTokenId: deedTokenId,
            deedOwner: msg.sender,
            totalShares: totalShares,
            active: true,
            fractionalizedAt: block.timestamp
        });
        
        // Mint the shares to the deed owner
        _mint(msg.sender, totalShares);
        
        emit LandFractionalized(
            deedTokenId,
            msg.sender,
            totalShares,
            tokenName,
            tokenSymbol,
            block.timestamp
        );
        
        return true;
    }

    /**
     * @dev Redeem shares for underlying deed (simplified version)
     * @param deedTokenId The deed NFT token ID
     * @param sharesAmount The amount of shares to redeem
     */
    function redeemShares(
        uint256 deedTokenId,
        uint256 sharesAmount
    ) external nonReentrant returns (bool) {
        require(fractionalizations[deedTokenId].active, "Deed not fractionalized");
        require(balanceOf(msg.sender) >= sharesAmount, "Insufficient shares");
        
        // Burn the shares
        _burn(msg.sender, sharesAmount);
        
        // Update fractionalization details
        fractionalizations[deedTokenId].totalShares -= sharesAmount;
        
        // If all shares are redeemed, mark as inactive
        if (fractionalizations[deedTokenId].totalShares == 0) {
            fractionalizations[deedTokenId].active = false;
        }
        
        emit SharesRedeemed(deedTokenId, msg.sender, sharesAmount, block.timestamp);
        
        return true;
    }

    /**
     * @dev Get fractionalization details for a deed
     * @param deedTokenId The deed NFT token ID
     */
    function getFractionalization(uint256 deedTokenId) external view returns (Fractionalization memory) {
        return fractionalizations[deedTokenId];
    }

    /**
     * @dev Check if deed is fractionalized
     * @param deedTokenId The deed NFT token ID
     */
    function isDeedFractionalized(uint256 deedTokenId) external view returns (bool) {
        return fractionalizations[deedTokenId].active;
    }
}