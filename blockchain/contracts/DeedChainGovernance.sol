// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title DeedChainGovernance
 * @dev Governance token and staking mechanism for validators
 */
contract DeedChainGovernance is AccessControl {
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");
    
    IERC20 public governanceToken;
    
    struct ValidatorStake {
        uint256 stakedAmount;
        uint256 stakedSince;
        uint256 rewardsClaimed;
        bool isActive;
    }
    
    mapping(address => ValidatorStake) public validatorStakes;
    uint256 public constant MIN_STAKE_AMOUNT = 1000 * 10**18; // 1000 tokens
    uint256 public constant REWARD_RATE = 10; // 10% annual reward
    
    event Staked(address indexed validator, uint256 amount, uint256 timestamp);
    event Unstaked(address indexed validator, uint256 amount, uint256 timestamp);
    event RewardsClaimed(address indexed validator, uint256 amount, uint256 timestamp);

    constructor(address _governanceToken) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GOVERNANCE_ROLE, msg.sender);
        governanceToken = IERC20(_governanceToken);
    }

    function stake(uint256 amount) external {
        require(amount >= MIN_STAKE_AMOUNT, "Insufficient stake amount");
        require(governanceToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        validatorStakes[msg.sender] = ValidatorStake({
            stakedAmount: amount,
            stakedSince: block.timestamp,
            rewardsClaimed: 0,
            isActive: true
        });
        
        emit Staked(msg.sender, amount, block.timestamp);
    }

    function unstake() external {
        ValidatorStake storage stakeInfo = validatorStakes[msg.sender];
        require(stakeInfo.isActive, "No active stake");
        require(stakeInfo.stakedAmount > 0, "No staked amount");
        
        // Calculate pending rewards
        uint256 pendingRewards = calculateRewards(msg.sender);
        uint256 totalAmount = stakeInfo.stakedAmount + pendingRewards;
        
        // Reset stake
        stakeInfo.isActive = false;
        stakeInfo.stakedAmount = 0;
        stakeInfo.rewardsClaimed += pendingRewards;
        
        // Transfer tokens back
        require(governanceToken.transfer(msg.sender, totalAmount), "Transfer failed");
        
        emit Unstaked(msg.sender, totalAmount, block.timestamp);
    }

    function claimRewards() external {
        ValidatorStake storage stakeInfo = validatorStakes[msg.sender];
        require(stakeInfo.isActive, "No active stake");
        
        uint256 pendingRewards = calculateRewards(msg.sender);
        require(pendingRewards > 0, "No rewards to claim");
        
        stakeInfo.rewardsClaimed += pendingRewards;
        stakeInfo.stakedSince = block.timestamp; // Reset reward calculation
        
        require(governanceToken.transfer(msg.sender, pendingRewards), "Transfer failed");
        
        emit RewardsClaimed(msg.sender, pendingRewards, block.timestamp);
    }

    function calculateRewards(address validator) public view returns (uint256) {
        ValidatorStake memory stakeInfo = validatorStakes[validator];
        if (!stakeInfo.isActive || stakeInfo.stakedAmount == 0) {
            return 0;
        }
        
        uint256 stakingDuration = block.timestamp - stakeInfo.stakedSince;
        uint256 annualReward = (stakeInfo.stakedAmount * REWARD_RATE) / 100;
        uint256 rewards = (annualReward * stakingDuration) / 365 days;
        
        return rewards;
    }

    function getValidatorStatus(address validator) public view returns (bool) {
        ValidatorStake memory stakeInfo = validatorStakes[validator];
        return stakeInfo.isActive && stakeInfo.stakedAmount >= MIN_STAKE_AMOUNT;
    }
}