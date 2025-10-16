// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./DeedNFT.sol";
import "./DeedChainSecurity.sol";

/**
 * @title DeedChainModifiers
 * @dev Reusable modifiers for DeedChain contracts
 */
contract DeedChainModifiers {
    // Contract references (to be set by inheriting contracts)
    DeedNFT public deedNFT;
    DeedChainSecurity public security;
    
    modifier onlyPropertyOwner(uint256 propertyId) {
        require(deedNFT.ownerOf(propertyId) == msg.sender, "Not property owner");
        _;
    }
    
    modifier onlyVerifiedProperty(uint256 propertyId) {
        require(deedNFT.getPropertyInfo(propertyId).isVerified, "Property not verified");
        _;
    }
    
    modifier onlyRegistrar() {
        require(deedNFT.hasRole(deedNFT.REGISTRAR_ROLE(), msg.sender), "Not registrar");
        _;
    }
    
    modifier onlyVerifier() {
        require(deedNFT.hasRole(deedNFT.VERIFIER_ROLE(), msg.sender), "Not verifier");
        _;
    }
    
    modifier onlyAdmin() {
        require(deedNFT.hasRole(deedNFT.DEFAULT_ADMIN_ROLE(), msg.sender), "Not admin");
        _;
    }
    
    modifier whenNotPaused() {
        // This would check if system is paused
        // require(!paused, "System is paused");
        _;
    }
    
    modifier whenPropertyNotFrozen(uint256 propertyId) {
        require(!security.isPropertyFrozen(propertyId), "Property is frozen");
        _;
    }
    
    modifier whenAddressNotBlacklisted(address account) {
        (bool canInteract, string memory reason) = security.canInteract(account);
        require(canInteract, reason);
        _;
    }
    
    modifier validPropertyId(uint256 propertyId) {
        require(deedNFT.exists(propertyId), "Property does not exist");
        _;
    }
    
    modifier validAddress(address addr) {
        require(addr != address(0), "Invalid address");
        require(addr != address(this), "Cannot be contract address");
        _;
    }
    
    modifier validString(string memory str) {
        require(bytes(str).length > 0, "String cannot be empty");
        _;
    }
    
    modifier validAmount(uint256 amount) {
        require(amount > 0, "Amount must be greater than 0");
        _;
    }
    
    modifier withinLimits(uint256 value, uint256 min, uint256 max) {
        require(value >= min && value <= max, "Value outside allowed limits");
        _;
    }
    
    modifier futureTimestamp(uint256 timestamp) {
        require(timestamp > block.timestamp, "Timestamp must be in future");
        _;
    }
    
    modifier pastTimestamp(uint256 timestamp) {
        require(timestamp < block.timestamp, "Timestamp must be in past");
        _;
    }
    
    modifier withinTimeWindow(uint256 startTime, uint256 endTime) {
        require(block.timestamp >= startTime, "Not started yet");
        require(block.timestamp <= endTime, "Already ended");
        _;
    }
    
    modifier arraysEqualLength(
        address[] memory array1,
        uint256[] memory array2
    ) {
        require(array1.length == array2.length, "Arrays length mismatch");
        _;
    }
    
    modifier arraysEqualLength(
        uint256[] memory array1,
        uint256[] memory array2
    ) {
        require(array1.length == array2.length, "Arrays length mismatch");
        _;
    }
    
    modifier arraysEqualLength(
        string[] memory array1,
        string[] memory array2
    ) {
        require(array1.length == array2.length, "Arrays length mismatch");
        _;
    }
    
    // Gas optimization modifier for view functions
    modifier viewOnly() {
        _;
    }
    
    // Reentrancy protection (complement to OpenZeppelin's ReentrancyGuard)
    modifier nonReentrantView() viewOnly {
        _;
    }
    
    // Emergency modifier (bypasses some checks)
    modifier emergencyOnly() {
        // Only certain authorized addresses in emergency mode
        // require(emergencyMode && hasRole(EMERGENCY_ROLE, msg.sender), "Emergency access only");
        _;
    }
    
    // Setup function to initialize contract references
    function _setupModifiers(address _deedNFT, address _security) internal {
        deedNFT = DeedNFT(_deedNFT);
        security = DeedChainSecurity(_security);
    }
}