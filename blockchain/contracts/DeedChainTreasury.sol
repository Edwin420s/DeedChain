// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title DeedChainTreasury
 * @dev Manages platform funds, fees, and treasury operations
 */
contract DeedChainTreasury is AccessControl, ReentrancyGuard {
    bytes32 public constant TREASURER_ROLE = keccak256("TREASURER_ROLE");
    bytes32 public constant WITHDRAWER_ROLE = keccak256("WITHDRAWER_ROLE");
    
    IERC20 public deedToken;
    
    struct TreasuryStats {
        uint256 totalRevenue;
        uint256 totalExpenses;
        uint256 currentBalance;
        uint256 validatorRewardsPaid;
        uint256 developmentFund;
    }
    
    struct BudgetAllocation {
        uint256 development;
        uint256 marketing;
        uint256 operations;
        uint256 validatorRewards;
        uint256 insurancePool;
        uint256 communityGrants;
    }
    
    BudgetAllocation public budgetAllocation;
    TreasuryStats public treasuryStats;
    
    event FundsReceived(address from, uint256 amount, string source, uint256 timestamp);
    event FundsWithdrawn(address to, uint256 amount, string purpose, uint256 timestamp);
    event BudgetAllocated(BudgetAllocation allocation, uint256 timestamp);
    event ValidatorRewardsDistributed(address[] validators, uint256[] amounts, uint256 timestamp);

    constructor(address _deedToken) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(TREASURER_ROLE, msg.sender);
        _grantRole(WITHDRAWER_ROLE, msg.sender);
        
        deedToken = IERC20(_deedToken);
        
        // Initial budget allocation (percentages)
        budgetAllocation = BudgetAllocation({
            development: 40,    // 40%
            marketing: 20,      // 20%
            operations: 15,     // 15%
            validatorRewards: 15, // 15%
            insurancePool: 5,   // 5%
            communityGrants: 5  // 5%
        });
    }

    function receiveFunds(uint256 amount, string memory source) public {
        require(amount > 0, "Amount must be greater than 0");
        require(deedToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        treasuryStats.totalRevenue += amount;
        treasuryStats.currentBalance += amount;
        
        emit FundsReceived(msg.sender, amount, source, block.timestamp);
    }

    function withdrawFunds(
        address to,
        uint256 amount,
        string memory purpose
    ) public onlyRole(WITHDRAWER_ROLE) nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(amount <= treasuryStats.currentBalance, "Insufficient treasury balance");
        require(deedToken.transfer(to, amount), "Transfer failed");
        
        treasuryStats.totalExpenses += amount;
        treasuryStats.currentBalance -= amount;
        
        emit FundsWithdrawn(to, amount, purpose, block.timestamp);
    }

    function allocateBudget(BudgetAllocation memory newAllocation) public onlyRole(TREASURER_ROLE) {
        require(
            newAllocation.development +
            newAllocation.marketing +
            newAllocation.operations +
            newAllocation.validatorRewards +
            newAllocation.insurancePool +
            newAllocation.communityGrants == 100,
            "Allocation must sum to 100%"
        );
        
        budgetAllocation = newAllocation;
        
        emit BudgetAllocated(newAllocation, block.timestamp);
    }

    function distributeValidatorRewards(
        address[] memory validators,
        uint256[] memory amounts
    ) public onlyRole(TREASURER_ROLE) nonReentrant {
        require(validators.length == amounts.length, "Arrays length mismatch");
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        
        require(totalAmount <= treasuryStats.currentBalance, "Insufficient treasury balance");
        
        for (uint256 i = 0; i < validators.length; i++) {
            if (amounts[i] > 0) {
                require(deedToken.transfer(validators[i], amounts[i]), "Transfer failed");
                treasuryStats.validatorRewardsPaid += amounts[i];
            }
        }
        
        treasuryStats.currentBalance -= totalAmount;
        treasuryStats.totalExpenses += totalAmount;
        
        emit ValidatorRewardsDistributed(validators, amounts, block.timestamp);
    }

    function calculateAllocationAmount(uint256 percentage) public view returns (uint256) {
        return (treasuryStats.currentBalance * percentage) / 100;
    }

    function getTreasuryBalance() public view returns (uint256) {
        return treasuryStats.currentBalance;
    }

    function getTokenBalance() public view returns (uint256) {
        return deedToken.balanceOf(address(this));
    }

    // Emergency withdrawal function (only admin)
    function emergencyWithdraw(address token, address to, uint256 amount) 
        public 
        onlyRole(DEFAULT_ADMIN_ROLE) 
        nonReentrant 
    {
        if (token == address(0)) {
            // Native token
            payable(to).transfer(amount);
        } else {
            // ERC20 token
            IERC20(token).transfer(to, amount);
        }
    }

    // Receive native tokens
    receive() external payable {
        treasuryStats.totalRevenue += msg.value;
        treasuryStats.currentBalance += msg.value;
        emit FundsReceived(msg.sender, msg.value, "NATIVE_DEPOSIT", block.timestamp);
    }
}