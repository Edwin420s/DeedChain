// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title DAOVerification
 * @dev DAO-based verification system for land deeds
 */
contract DAOVerification is AccessControl {
    using Counters for Counters.Counter;
    
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant DAO_MEMBER_ROLE = keccak256("DAO_MEMBER_ROLE");
    
    Counters.Counter private _proposalIdCounter;
    
    // Verification proposal structure
    struct VerificationProposal {
        uint256 proposalId;
        uint256 deedTokenId;
        address proposer;
        string description;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 startTime;
        uint256 endTime;
        bool executed;
        mapping(address => bool) hasVoted;
    }
    
    // Mapping from proposal ID to proposal details
    mapping(uint256 => VerificationProposal) public proposals;
    
    // Mapping from deed token ID to active proposal ID
    mapping(uint256 => uint256) public deedToProposal;
    
    // Voting period (3 days)
    uint256 public constant VOTING_PERIOD = 3 days;
    
    // Minimum votes required for proposal execution
    uint256 public constant MIN_VOTES = 3;
    
    // Events
    event VerificationProposed(
        uint256 indexed proposalId,
        uint256 indexed deedTokenId,
        address indexed proposer,
        string description,
        uint256 startTime,
        uint256 endTime
    );
    
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        bool support,
        uint256 timestamp
    );
    
    event ProposalExecuted(
        uint256 indexed proposalId,
        uint256 indexed deedTokenId,
        bool approved,
        uint256 timestamp
    );

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(DAO_MEMBER_ROLE, msg.sender);
    }

    /**
     * @dev Propose verification for a land deed
     * @param deedTokenId The deed NFT token ID to verify
     * @param description Description of the verification proposal
     */
    function proposeVerification(
        uint256 deedTokenId,
        string memory description
    ) external onlyRole(VERIFIER_ROLE) returns (uint256) {
        require(deedToProposal[deedTokenId] == 0, "Proposal already exists for this deed");
        
        _proposalIdCounter.increment();
        uint256 proposalId = _proposalIdCounter.current();
        
        VerificationProposal storage newProposal = proposals[proposalId];
        newProposal.proposalId = proposalId;
        newProposal.deedTokenId = deedTokenId;
        newProposal.proposer = msg.sender;
        newProposal.description = description;
        newProposal.votesFor = 0;
        newProposal.votesAgainst = 0;
        newProposal.startTime = block.timestamp;
        newProposal.endTime = block.timestamp + VOTING_PERIOD;
        newProposal.executed = false;
        
        deedToProposal[deedTokenId] = proposalId;
        
        emit VerificationProposed(
            proposalId,
            deedTokenId,
            msg.sender,
            description,
            block.timestamp,
            block.timestamp + VOTING_PERIOD
        );
        
        return proposalId;
    }

    /**
     * @dev Cast vote on verification proposal
     * @param proposalId The proposal ID to vote on
     * @param support Whether to support the proposal (true = for, false = against)
     */
    function castVote(uint256 proposalId, bool support) external onlyRole(DAO_MEMBER_ROLE) {
        VerificationProposal storage proposal = proposals[proposalId];
        
        require(proposal.proposalId != 0, "Proposal does not exist");
        require(block.timestamp >= proposal.startTime, "Voting not started");
        require(block.timestamp <= proposal.endTime, "Voting period ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        require(!proposal.executed, "Proposal already executed");
        
        proposal.hasVoted[msg.sender] = true;
        
        if (support) {
            proposal.votesFor += 1;
        } else {
            proposal.votesAgainst += 1;
        }
        
        emit VoteCast(proposalId, msg.sender, support, block.timestamp);
    }

    /**
     * @dev Execute verification proposal
     * @param proposalId The proposal ID to execute
     */
    function executeProposal(uint256 proposalId) external {
        VerificationProposal storage proposal = proposals[proposalId];
        
        require(proposal.proposalId != 0, "Proposal does not exist");
        require(block.timestamp > proposal.endTime, "Voting period not ended");
        require(!proposal.executed, "Proposal already executed");
        require(proposal.votesFor + proposal.votesAgainst >= MIN_VOTES, "Insufficient votes");
        
        proposal.executed = true;
        
        bool approved = proposal.votesFor > proposal.votesAgainst;
        
        // In a real implementation, this would call the LandRegistry contract
        // to update the verification status
        
        emit ProposalExecuted(proposalId, proposal.deedTokenId, approved, block.timestamp);
    }

    /**
     * @dev Get proposal details
     * @param proposalId The proposal ID to query
     */
    function getProposal(uint256 proposalId) external view returns (
        uint256,
        uint256,
        address,
        string memory,
        uint256,
        uint256,
        uint256,
        uint256,
        bool
    ) {
        VerificationProposal storage proposal = proposals[proposalId];
        require(proposal.proposalId != 0, "Proposal does not exist");
        
        return (
            proposal.proposalId,
            proposal.deedTokenId,
            proposal.proposer,
            proposal.description,
            proposal.votesFor,
            proposal.votesAgainst,
            proposal.startTime,
            proposal.endTime,
            proposal.executed
        );
    }

    /**
     * @dev Check if address has voted on proposal
     * @param proposalId The proposal ID
     * @param voter The voter address
     */
    function hasVoted(uint256 proposalId, address voter) external view returns (bool) {
        return proposals[proposalId].hasVoted[voter];
    }

    /**
     * @dev Get active proposal for a deed
     * @param deedTokenId The deed token ID
     */
    function getActiveProposal(uint256 deedTokenId) external view returns (uint256) {
        return deedToProposal[deedTokenId];
    }

    /**
     * @dev Get total number of proposals
     */
    function totalProposals() external view returns (uint256) {
        return _proposalIdCounter.current();
    }
}