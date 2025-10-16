// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./DeedNFT.sol";

/**
 * @title PropertyInsurance
 * @dev Insurance pool for property disputes and title insurance
 */
contract PropertyInsurance is AccessControl, ReentrancyGuard {
    bytes32 public constant INSURER_ROLE = keccak256("INSURER_ROLE");
    bytes32 public constant CLAIM_ADJUSTER_ROLE = keccak256("CLAIM_ADJUSTER_ROLE");
    
    DeedNFT public deedNFT;
    
    struct InsurancePolicy {
        uint256 policyId;
        uint256 propertyId;
        address insured;
        uint256 premiumAmount;
        uint256 coverageAmount;
        uint256 startDate;
        uint256 endDate;
        bool isActive;
        uint256 claimsCount;
    }
    
    struct InsuranceClaim {
        uint256 claimId;
        uint256 policyId;
        address claimant;
        uint256 claimAmount;
        string claimReason;
        uint256 claimDate;
        bool approved;
        bool paid;
        address adjustedBy;
    }
    
    mapping(uint256 => InsurancePolicy) public policies;
    mapping(uint256 => InsuranceClaim) public claims;
    mapping(uint256 => uint256[]) public propertyPolicies;
    
    uint256 public policyCounter;
    uint256 public claimCounter;
    uint256 public constant INSURANCE_DURATION = 365 days;
    uint256 public constant PREMIUM_RATE = 1; // 1% of coverage amount
    
    event PolicyIssued(
        uint256 indexed policyId,
        uint256 indexed propertyId,
        address indexed insured,
        uint256 coverageAmount,
        uint256 premiumAmount,
        uint256 endDate
    );
    
    event ClaimFiled(
        uint256 indexed claimId,
        uint256 indexed policyId,
        address indexed claimant,
        uint256 claimAmount,
        string claimReason
    );
    
    event ClaimApproved(
        uint256 indexed claimId,
        uint256 indexed policyId,
        uint256 payoutAmount,
        address approvedBy
    );

    constructor(address deedNFTAddress) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(INSURER_ROLE, msg.sender);
        _grantRole(CLAIM_ADJUSTER_ROLE, msg.sender);
        deedNFT = DeedNFT(deedNFTAddress);
    }

    function issuePolicy(
        uint256 propertyId,
        uint256 coverageAmount
    ) public payable returns (uint256) {
        require(deedNFT.ownerOf(propertyId) == msg.sender, "Not property owner");
        require(deedNFT.getPropertyInfo(propertyId).isVerified, "Property not verified");
        require(coverageAmount > 0, "Invalid coverage amount");
        
        uint256 premiumAmount = (coverageAmount * PREMIUM_RATE) / 100;
        require(msg.value >= premiumAmount, "Insufficient premium payment");
        
        policyCounter++;
        
        policies[policyCounter] = InsurancePolicy({
            policyId: policyCounter,
            propertyId: propertyId,
            insured: msg.sender,
            premiumAmount: premiumAmount,
            coverageAmount: coverageAmount,
            startDate: block.timestamp,
            endDate: block.timestamp + INSURANCE_DURATION,
            isActive: true,
            claimsCount: 0
        });
        
        propertyPolicies[propertyId].push(policyCounter);
        
        // Refund excess payment
        if (msg.value > premiumAmount) {
            payable(msg.sender).transfer(msg.value - premiumAmount);
        }
        
        emit PolicyIssued(policyCounter, propertyId, msg.sender, coverageAmount, premiumAmount, block.timestamp + INSURANCE_DURATION);
        return policyCounter;
    }

    function fileClaim(
        uint256 policyId,
        uint256 claimAmount,
        string memory claimReason
    ) public returns (uint256) {
        InsurancePolicy storage policy = policies[policyId];
        require(policy.insured == msg.sender, "Not policy holder");
        require(policy.isActive, "Policy not active");
        require(block.timestamp <= policy.endDate, "Policy expired");
        require(claimAmount <= policy.coverageAmount, "Claim exceeds coverage");
        
        claimCounter++;
        
        claims[claimCounter] = InsuranceClaim({
            claimId: claimCounter,
            policyId: policyId,
            claimant: msg.sender,
            claimAmount: claimAmount,
            claimReason: claimReason,
            claimDate: block.timestamp,
            approved: false,
            paid: false,
            adjustedBy: address(0)
        });
        
        policy.claimsCount++;
        
        emit ClaimFiled(claimCounter, policyId, msg.sender, claimAmount, claimReason);
        return claimCounter;
    }

    function approveClaim(uint256 claimId) public onlyRole(CLAIM_ADJUSTER_ROLE) nonReentrant {
        InsuranceClaim storage claim = claims[claimId];
        InsurancePolicy storage policy = policies[claim.policyId];
        
        require(!claim.approved, "Claim already approved");
        require(policy.isActive, "Policy not active");
        require(claim.claimAmount <= policy.coverageAmount, "Claim exceeds coverage");
        
        claim.approved = true;
        claim.adjustedBy = msg.sender;
        
        // Calculate payout (could have deductibles or other logic)
        uint256 payoutAmount = claim.claimAmount;
        
        // Transfer payout to claimant
        payable(claim.claimant).transfer(payoutAmount);
        claim.paid = true;
        
        // Deactivate policy after claim
        policy.isActive = false;
        
        emit ClaimApproved(claimId, claim.policyId, payoutAmount, msg.sender);
    }

    function getPropertyPolicies(uint256 propertyId) public view returns (uint256[] memory) {
        return propertyPolicies[propertyId];
    }

    function getPolicyClaims(uint256 policyId) public view returns (uint256[] memory) {
        uint256[] memory result = new uint256[](policies[policyId].claimsCount);
        uint256 counter = 0;
        
        for (uint256 i = 1; i <= claimCounter; i++) {
            if (claims[i].policyId == policyId) {
                result[counter] = i;
                counter++;
            }
        }
        return result;
    }

    function calculatePremium(uint256 coverageAmount) public pure returns (uint256) {
        return (coverageAmount * PREMIUM_RATE) / 100;
    }

    // Function to add funds to insurance pool
    function fundPool() public payable onlyRole(INSURER_ROLE) {
        // Funds are stored in contract for claim payouts
    }

    function getPoolBalance() public view returns (uint256) {
        return address(this).balance;
    }
}