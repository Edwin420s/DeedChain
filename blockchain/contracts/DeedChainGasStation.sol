// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title DeedChainGasStation
 * @dev Gas abstraction and meta-transactions for improved user experience
 */
contract DeedChainGasStation is AccessControl, ReentrancyGuard {
    bytes32 public constant GAS_STATION_OPERATOR_ROLE = keccak256("GAS_STATION_OPERATOR_ROLE");
    
    IERC20 public deedToken;
    
    struct GasTank {
        address user;
        uint256 balance;
        uint256 lastUsed;
        uint256 totalSponsored;
        bool isActive;
    }
    
    struct SponsoredTransaction {
        bytes32 txHash;
        address user;
        uint256 gasCost;
        uint256 timestamp;
        bool reimbursed;
    }
    
    mapping(address => GasTank) public gasTanks;
    mapping(bytes32 => SponsoredTransaction) public sponsoredTransactions;
    mapping(address => uint256) public userGasLimits;
    
    uint256 public constant GAS_BUFFER = 50000; // Additional gas buffer
    uint256 public constant MAX_GAS_PRICE = 100 gwei; // Maximum gas price to sponsor
    uint256 public sponsorshipPool;
    
    event GasTankFunded(address indexed user, uint256 amount, address fundedBy, uint256 timestamp);
    event GasTankWithdrawn(address indexed user, uint256 amount, uint256 timestamp);
    transactionSponsored(bytes32 indexed txHash, address indexed user, uint256 gasCost, uint256 timestamp);
    event GasReimbursed(bytes32 indexed txHash, address indexed user, uint256 amount, uint256 timestamp);

    constructor(address _deedToken) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GAS_STATION_OPERATOR_ROLE, msg.sender);
        
        deedToken = IERC20(_deedToken);
    }

    function fundGasTank(uint256 amount) public {
        require(amount > 0, "Amount must be greater than 0");
        require(deedToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        GasTank storage tank = gasTanks[msg.sender];
        if (tank.user == address(0)) {
            tank.user = msg.sender;
            tank.isActive = true;
        }
        
        tank.balance += amount;
        
        emit GasTankFunded(msg.sender, amount, msg.sender, block.timestamp);
    }

    function sponsorGasTank(address user, uint256 amount) public onlyRole(GAS_STATION_OPERATOR_ROLE) {
        require(amount > 0, "Amount must be greater than 0");
        require(sponsorshipPool >= amount, "Insufficient sponsorship pool");
        
        GasTank storage tank = gasTanks[user];
        if (tank.user == address(0)) {
            tank.user = user;
            tank.isActive = true;
        }
        
        tank.balance += amount;
        sponsorshipPool -= amount;
        tank.totalSponsored += amount;
        
        emit GasTankFunded(user, amount, msg.sender, block.timestamp);
    }

    function executeWithGasSponsorship(
        address target,
        bytes memory data,
        uint256 gasLimit
    ) public returns (bytes32) {
        GasTank storage tank = gasTanks[msg.sender];
        require(tank.isActive, "Gas tank not active");
        require(tank.balance > 0, "Insufficient gas balance");
        
        uint256 gasBefore = gasleft();
        
        // Execute transaction
        (bool success, ) = target.call{gas: gasLimit}(data);
        require(success, "Transaction execution failed");
        
        uint256 gasUsed = gasBefore - gasleft() + GAS_BUFFER;
        uint256 gasCost = gasUsed * tx.gasprice;
        
        require(gasCost <= tank.balance, "Insufficient gas balance for transaction");
        require(tx.gasprice <= MAX_GAS_PRICE, "Gas price too high");
        
        tank.balance -= gasCost;
        tank.lastUsed = block.timestamp;
        
        bytes32 txHash = keccak256(abi.encodePacked(target, data, block.timestamp, msg.sender));
        
        sponsoredTransactions[txHash] = SponsoredTransaction({
            txHash: txHash,
            user: msg.sender,
            gasCost: gasCost,
            timestamp: block.timestamp,
            reimbursed: false
        });
        
        emit TransactionSponsored(txHash, msg.sender, gasCost, block.timestamp);
        
        return txHash;
    }

    function withdrawFromGasTank(uint256 amount) public nonReentrant {
        GasTank storage tank = gasTanks[msg.sender];
        require(tank.balance >= amount, "Insufficient balance");
        
        tank.balance -= amount;
        
        require(deedToken.transfer(msg.sender, amount), "Withdrawal failed");
        
        emit GasTankWithdrawn(msg.sender, amount, block.timestamp);
    }

    function reimburseGas(bytes32 txHash) public onlyRole(GAS_STATION_OPERATOR_ROLE) {
        SponsoredTransaction storage transaction = sponsoredTransactions[txHash];
        require(transaction.txHash != bytes32(0), "Transaction not found");
        require(!transaction.reimbursed, "Already reimbursed");
        
        GasTank storage tank = gasTanks[transaction.user];
        tank.balance += transaction.gasCost;
        transaction.reimbursed = true;
        
        emit GasReimbursed(txHash, transaction.user, transaction.gasCost, block.timestamp);
    }

    function addToSponsorshipPool(uint256 amount) public onlyRole(GAS_STATION_OPERATOR_ROLE) {
        require(amount > 0, "Amount must be greater than 0");
        require(deedToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        sponsorshipPool += amount;
    }

    function setUserGasLimit(address user, uint256 gasLimit) public onlyRole(GAS_STATION_OPERATOR_ROLE) {
        userGasLimits[user] = gasLimit;
    }

    function getUserGasTank(address user) public view returns (GasTank memory) {
        return gasTanks[user];
    }

    function estimateGasCost(
        address target,
        bytes memory data,
        uint256 gasLimit
    ) public view returns (uint256) {
        // This would provide gas estimation
        // For now, return a conservative estimate
        return gasLimit * tx.gasprice;
    }

    function getSponsorshipPoolBalance() public view returns (uint256) {
        return sponsorshipPool;
    }

    function emergencyWithdrawPool(uint256 amount) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(amount <= sponsorshipPool, "Insufficient pool balance");
        
        sponsorshipPool -= amount;
        require(deedToken.transfer(msg.sender, amount), "Emergency withdrawal failed");
    }
}