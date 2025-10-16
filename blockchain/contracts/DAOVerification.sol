// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "./DeedNFT.sol";

/**
 * @title DAOVerification
 * @dev DAO-based verification system for property validation
 */
contract DAOVerification is AccessControl {
    using EnumerableSet for EnumerableSet.AddressSet;
    
    bytes32 public constant VALIDATOR_ROLE = keccak256("VALIDATOR_ROLE");
    
    DeedNFT public deedNFT;
    
    struct VerificationProposal {
        uint256 propertyId;
        address proposer;
        uint256 startTime;
        uint256 endTime;
        uint256 yesVotes;
        uint256 noVotes;
        bool executed;
        mapping(address => bool) hasVoted;
    }
    
    mapping(uint256 => VerificationProposal) public verificationProposals;
    EnumerableSet.AddressSet private validators;
    
    uint256 public constant VOTING_DURATION = 3 days;
    uint256 public constant MIN_APPROVAL_THRESHOLD = 2; // Minimum votes required
    
    event VerificationProposed(
        uint256 indexed proposalId,
        uint256 indexed propertyId,
        address indexed proposer,
        uint256 startTime
    );
    
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        bool support,
        uint256 timestamp
    );
    
    event VerificationExecuted(
        uint256 indexed proposalId,
        uint256 indexed propertyId,
        bool approved,
        uint256 timestamp
    );

    constructor(address deedNFTAddress) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VALIDATOR_ROLE, msg.sender);
        deedNFT = DeedNFT(deedNFTAddress);
        validators.add(msg.sender);
    }

    function proposeVerification(uint256 propertyId) public onlyRole(VALIDATOR_ROLE) returns (uint256) {
        require(!deedNFT.getPropertyInfo(propertyId).isVerified, "Property already verified");
        require(verificationProposals[propertyId].proposer == address(0), "Proposal already exists");
        
        VerificationProposal storage proposal = verificationProposals[propertyId];
        proposal.propertyId = propertyId;
        proposal.proposer = msg.sender;
        proposal.startTime = block.timestamp;
        proposal.endTime = block.timestamp + VOTING_DURATION;
        proposal.executed = false;
        
        emit VerificationProposed(propertyId, propertyId, msg.sender, block.timestamp);
        return propertyId;
    }

    function voteOnVerification(uint256 propertyId, bool support) public onlyRole(VALIDATOR_ROLE) {
        VerificationProposal storage proposal = verificationProposals[propertyId];
        require(proposal.proposer != address(0), "Proposal does not exist");
        require(block.timestamp <= proposal.endTime, "Voting period ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        
        proposal.hasVoted[msg.sender] = true;
        
        if (support) {
            proposal.yesVotes++;
        } else {
            proposal.noVotes++;
        }
        
        emit VoteCast(propertyId, msg.sender, support, block.timestamp);
    }

    function executeVerification(uint256 propertyId) public {
        VerificationProposal storage proposal = verificationProposals[propertyId];
        require(proposal.proposer != address(0), "Proposal does not exist");
        require(block.timestamp > proposal.endTime, "Voting period not ended");
        require(!proposal.executed, "Proposal already executed");
        
        proposal.executed = true;
        
        if (proposal.yesVotes >= MIN_APPROVAL_THRESHOLD && proposal.yesVotes > proposal.noVotes) {
            deedNFT.verifyProperty(propertyId);
            emit VerificationExecuted(propertyId, propertyId, true, block.timestamp);
        } else {
            emit VerificationExecuted(propertyId, propertyId, false, block.timestamp);
        }
    }

    function addValidator(address validator) public onlyRole(DEFAULT_ADMIN_ROLE) {
        validators.add(validator);
        _grantRole(VALIDATOR_ROLE, validator);
    }

    function removeValidator(address validator) public onlyRole(DEFAULT_ADMIN_ROLE) {
        validators.remove(validator);
        _revokeRole(VALIDATOR_ROLE, validator);
    }

    function getValidators() public view returns (address[] memory) {
        return validators.values();
    }

    function getProposalStatus(uint256 propertyId) public view returns (
        uint256 yesVotes,
        uint256 noVotes,
        uint256 endTime,
        bool executed
    ) {
        VerificationProposal storage proposal = verificationProposals[propertyId];
        return (
            proposal.yesVotes,
            proposal.noVotes,
            proposal.endTime,
            proposal.executed
        );
    }
}