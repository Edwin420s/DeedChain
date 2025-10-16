// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title DeedChainUpgradeable
 * @dev Upgradeable version of DeedChain core contracts using UUPS pattern
 */
contract DeedChainUpgradeable is Initializable, AccessControlUpgradeable, UUPSUpgradeable {
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    
    // Version tracking
    string public version;
    uint256 public deploymentTimestamp;
    
    // System state
    bool public systemPaused;
    address public treasury;
    address public emergencyAdmin;
    
    event SystemUpgraded(string newVersion, address upgradedBy, uint256 timestamp);
    event SystemPaused(address pausedBy, uint256 timestamp);
    event SystemUnpaused(address unpausedBy, uint256 timestamp);
    event EmergencyWithdrawal(address token, uint256 amount, address initiatedBy, uint256 timestamp);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address defaultAdmin,
        address upgrader,
        address _treasury,
        address _emergencyAdmin
    ) public initializer {
        __AccessControl_init();
        __UUPSUpgradeable_init();
        
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(UPGRADER_ROLE, upgrader);
        
        treasury = _treasury;
        emergencyAdmin = _emergencyAdmin;
        version = "1.0.0";
        deploymentTimestamp = block.timestamp;
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyRole(UPGRADER_ROLE)
    {}

    function pauseSystem() public onlyRole(DEFAULT_ADMIN_ROLE) {
        systemPaused = true;
        emit SystemPaused(msg.sender, block.timestamp);
    }

    function unpauseSystem() public onlyRole(DEFAULT_ADMIN_ROLE) {
        systemPaused = false;
        emit SystemUnpaused(msg.sender, block.timestamp);
    }

    function emergencyWithdraw(
        address token,
        uint256 amount,
        address to
    ) public {
        require(msg.sender == emergencyAdmin, "Only emergency admin");
        require(to != address(0), "Invalid recipient");
        
        if (token == address(0)) {
            payable(to).transfer(amount);
        } else {
            // IERC20(token).transfer(to, amount);
            // Implementation would depend on token interface
        }
        
        emit EmergencyWithdrawal(token, amount, msg.sender, block.timestamp);
    }

    function updateVersion(string memory newVersion) public onlyRole(UPGRADER_ROLE) {
        version = newVersion;
        emit SystemUpgraded(newVersion, msg.sender, block.timestamp);
    }

    function getImplementation() public view returns (address) {
        return _getImplementation();
    }

    // Modifier to check if system is not paused
    modifier whenNotPaused() {
        require(!systemPaused, "System is paused");
        _;
    }

    // Additional utility functions for upgradeable contracts
    function transferAdminRole(address newAdmin) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newAdmin != address(0), "Invalid admin address");
        _grantRole(DEFAULT_ADMIN_ROLE, newAdmin);
        _revokeRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function addUpgrader(address newUpgrader) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(UPGRADER_ROLE, newUpgrader);
    }

    function removeUpgrader(address upgrader) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(UPGRADER_ROLE, upgrader);
    }
}