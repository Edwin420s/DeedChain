// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title DeedChainRewards
 * @dev Rewards and incentives system for DeedChain ecosystem participants
 */
contract DeedChainRewards is AccessControl, ReentrancyGuard {
    bytes32 public constant REWARDS_MANAGER_ROLE = keccak256("REWARDS_MANAGER_ROLE");
    
    IERC20 public rewardToken;
    
    enum RewardType { REGISTRATION, VERIFICATION, TRANSACTION, STAKING, REFERRAL }
    
    struct RewardRule {
        RewardType rewardType;
        uint256 points;
        uint256 tokenAmount;
        uint256 cooldown;
        bool isActive;
    }
    
    struct UserRewards {
        uint256 totalPoints;
        uint256 totalTokensEarned;
        uint256 pendingTokens;
        uint256 lastClaim;
        mapping(RewardType => uint256) lastRewardTime;
        mapping(RewardType => uint256) rewardsCount;
    }
    
    struct StakingPool {
        uint256 poolId;
        string name;
        uint256 totalStaked;
        uint256 rewardRate; // tokens per block
        uint256 lockPeriod;
        uint256 totalRewards;
        bool isActive;
    }
    
    mapping(RewardType => RewardRule) public rewardRules;
    mapping(address => UserRewards) public userRewards;
    mapping(uint256 => StakingPool) public stakingPools;
    mapping(address => mapping(uint256 => uint256)) public userStakes;
    mapping(address => uint256[]) public userStakedPools;
    
    uint256 public poolCounter;
    uint256 public totalStaked;
    uint256 public totalRewardsDistributed;
    
    event RewardEarned(
        address indexed user,
        RewardType rewardType,
        uint256 points,
        uint256 tokenAmount,
        uint256 timestamp
    );
    
    event RewardsClaimed(
        address indexed user,
        uint256 tokenAmount,
        uint256 timestamp
    );
    
    event Staked(
        address indexed user,
        uint256 indexed poolId,
        uint256 amount,
        uint256 timestamp
    );
    
    event Unstaked(
        address indexed user,
        uint256 indexed poolId,
        uint256 amount,
        uint256 reward,
        uint256 timestamp
    );
    
    event PoolCreated(
        uint256 indexed poolId,
        string name,
        uint256 rewardRate,
        uint256 lockPeriod,
        uint256 timestamp
    );

    constructor(address _rewardToken) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(REWARDS_MANAGER_ROLE, msg.sender);
        
        rewardToken = IERC20(_rewardToken);
        
        // Initialize default reward rules
        _initializeRewardRules();
    }

    function _initializeRewardRules() internal {
        rewardRules[RewardType.REGISTRATION] = RewardRule({
            rewardType: RewardType.REGISTRATION,
            points: 100,
            tokenAmount: 10 * 10**18, // 10 tokens
            cooldown: 0,
            isActive: true
        });
        
        rewardRules[RewardType.VERIFICATION] = RewardRule({
            rewardType: RewardType.VERIFICATION,
            points: 50,
            tokenAmount: 5 * 10**18, // 5 tokens
            cooldown: 0,
            isActive: true
        });
        
        rewardRules[RewardType.TRANSACTION] = RewardRule({
            rewardType: RewardType.TRANSACTION,
            points: 20,
            tokenAmount: 2 * 10**18, // 2 tokens
            cooldown: 1 days,
            isActive: true
        });
        
        rewardRules[RewardType.REFERRAL] = RewardRule({
            rewardType: RewardType.REFERRAL,
            points: 25,
            tokenAmount: 2.5 * 10**18, // 2.5 tokens
            cooldown: 0,
            isActive: true
        });
    }

    function earnReward(
        address user,
        RewardType rewardType,
        uint256 customAmount
    ) public onlyRole(REWARDS_MANAGER_ROLE) nonReentrant {
        RewardRule memory rule = rewardRules[rewardType];
        require(rule.isActive, "Reward type not active");
        
        UserRewards storage userReward = userRewards[user];
        
        // Check cooldown
        if (rule.cooldown > 0) {
            require(
                block.timestamp >= userReward.lastRewardTime[rewardType] + rule.cooldown,
                "Reward cooldown active"
            );
        }
        
        uint256 tokenAmount = customAmount > 0 ? customAmount : rule.tokenAmount;
        
        userReward.totalPoints += rule.points;
        userReward.pendingTokens += tokenAmount;
        userReward.lastRewardTime[rewardType] = block.timestamp;
        userReward.rewardsCount[rewardType]++;
        
        totalRewardsDistributed += tokenAmount;
        
        emit RewardEarned(user, rewardType, rule.points, tokenAmount, block.timestamp);
    }

    function claimRewards() public nonReentrant {
        UserRewards storage userReward = userRewards[msg.sender];
        uint256 pendingTokens = userReward.pendingTokens;
        
        require(pendingTokens > 0, "No rewards to claim");
        require(rewardToken.balanceOf(address(this)) >= pendingTokens, "Insufficient reward tokens");
        
        userReward.pendingTokens = 0;
        userReward.totalTokensEarned += pendingTokens;
        userReward.lastClaim = block.timestamp;
        
        require(rewardToken.transfer(msg.sender, pendingTokens), "Reward transfer failed");
        
        emit RewardsClaimed(msg.sender, pendingTokens, block.timestamp);
    }

    function createStakingPool(
        string memory name,
        uint256 rewardRate,
        uint256 lockPeriod
    ) public onlyRole(REWARDS_MANAGER_ROLE) returns (uint256) {
        poolCounter++;
        
        stakingPools[poolCounter] = StakingPool({
            poolId: poolCounter,
            name: name,
            totalStaked: 0,
            rewardRate: rewardRate,
            lockPeriod: lockPeriod,
            totalRewards: 0,
            isActive: true
        });
        
        emit PoolCreated(poolCounter, name, rewardRate, lockPeriod, block.timestamp);
        return poolCounter;
    }

    function stake(uint256 poolId, uint256 amount) public nonReentrant {
        StakingPool storage pool = stakingPools[poolId];
        require(pool.isActive, "Pool not active");
        require(amount > 0, "Invalid stake amount");
        
        require(
            rewardToken.transferFrom(msg.sender, address(this), amount),
            "Token transfer failed"
        );
        
        userStakes[msg.sender][poolId] += amount;
        pool.totalStaked += amount;
        totalStaked += amount;
        
        // Add to user's staked pools if not already there
        if (userStakes[msg.sender][poolId] == amount) {
            userStakedPools[msg.sender].push(poolId);
        }
        
        emit Staked(msg.sender, poolId, amount, block.timestamp);
    }

    function unstake(uint256 poolId, uint256 amount) public nonReentrant {
        StakingPool storage pool = stakingPools[poolId];
        require(userStakes[msg.sender][poolId] >= amount, "Insufficient stake");
        
        uint256 stakedTime = block.timestamp; // Would track actual stake time
        require(stakedTime + pool.lockPeriod <= block.timestamp, "Stake still locked");
        
        // Calculate rewards
        uint256 reward = calculateRewards(msg.sender, poolId);
        
        userStakes[msg.sender][poolId] -= amount;
        pool.totalStaked -= amount;
        totalStaked -= amount;
        
        uint256 totalAmount = amount + reward;
        
        require(
            rewardToken.transfer(msg.sender, totalAmount),
            "Unstake transfer failed"
        );
        
        pool.totalRewards += reward;
        totalRewardsDistributed += reward;
        
        emit Unstaked(msg.sender, poolId, amount, reward, block.timestamp);
    }

    function calculateRewards(address user, uint256 poolId) public view returns (uint256) {
        StakingPool memory pool = stakingPools[poolId];
        uint256 userStake = userStakes[user][poolId];
        
        if (userStake == 0) return 0;
        
        // Simplified reward calculation
        // In production, this would use block-based calculation
        uint256 stakingDuration = 30 days; // Placeholder
        return (userStake * pool.rewardRate * stakingDuration) / (365 days * 100);
    }

    function getUserStakedPools(address user) public view returns (uint256[] memory) {
        return userStakedPools[user];
    }

    function getUserTotalRewards(address user) public view returns (uint256) {
        return userRewards[user].totalTokensEarned + userRewards[user].pendingTokens;
    }

    function updateRewardRule(
        RewardType rewardType,
        uint256 points,
        uint256 tokenAmount,
        uint256 cooldown,
        bool isActive
    ) public onlyRole(REWARDS_MANAGER_ROLE) {
        rewardRules[rewardType] = RewardRule({
            rewardType: rewardType,
            points: points,
            tokenAmount: tokenAmount,
            cooldown: cooldown,
            isActive: isActive
        });
    }

    function fundRewardsPool(uint256 amount) public onlyRole(REWARDS_MANAGER_ROLE) {
        require(
            rewardToken.transferFrom(msg.sender, address(this), amount),
            "Funding transfer failed"
        );
    }

    function getRewardsPoolBalance() public view returns (uint256) {
        return rewardToken.balanceOf(address(this));
    }
}