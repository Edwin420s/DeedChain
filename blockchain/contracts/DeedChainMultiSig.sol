// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title DeedChainMultiSig
 * @dev Multi-signature wallet for DAO treasury and critical operations
 */
contract DeedChainMultiSig is AccessControl {
    bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");
    
    enum ProposalStatus { PENDING, APPROVED, EXECUTED, REJECTED }
    enum ProposalType { TRANSFER, CONFIG_UPDATE, CONTRACT_UPGRADE, EMERGENCY }
    
    struct Proposal {
        uint256 proposalId;
        ProposalType proposalType;
        address proposer;
        address target;
        uint256 value;
        bytes data;
        string description;
        ProposalStatus status;
        uint256 creationTime;
        uint256 executionTime;
        uint256 approvalCount;
        mapping(address => bool) approvals;
    }
    
    mapping(uint256 => Proposal) public proposals;
    address[] public signers;
    uint256 public requiredSignatures;
    uint256 public proposalCounter;
    
    uint256 public constant PROPOSAL_TIMELOCK = 2 days;
    uint256 public constant MAX_SIGNERS = 10;
    
    event ProposalCreated(
        uint256 indexed proposalId,
        ProposalType proposalType,
        address indexed proposer,
        string description,
        uint256 timestamp
    );
    
    event ProposalApproved(
        uint256 indexed proposalId,
        address indexed approver,
        uint256 approvalCount,
        uint256 timestamp
    );
    
    event ProposalExecuted(
        uint256 indexed proposalId,
        address indexed executor,
        uint256 timestamp
    );
    
    event ProposalRejected(
        uint256 indexed proposalId,
        address indexed rejector,
        uint256 timestamp
    );
    
    event SignerAdded(address indexed signer, address indexed addedBy, uint256 timestamp);
    event SignerRemoved(address indexed signer, address indexed removedBy, uint256 timestamp);

    constructor(address[] memory _signers, uint256 _requiredSignatures) {
        require(_signers.length > 0, "No signers provided");
        require(_requiredSignatures > 0, "Required signatures must be > 0");
        require(_requiredSignatures <= _signers.length, "Required signatures exceed signers");
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PROPOSER_ROLE, msg.sender);
        
        for (uint256 i = 0; i < _signers.length; i++) {
            _addSigner(_signers[i]);
        }
        
        requiredSignatures = _requiredSignatures;
    }

    function propose(
        ProposalType proposalType,
        address target,
        uint256 value,
        bytes memory data,
        string memory description
    ) public onlyRole(PROPOSER_ROLE) returns (uint256) {
        proposalCounter++;
        
        Proposal storage proposal = proposals[proposalCounter];
        proposal.proposalId = proposalCounter;
        proposal.proposalType = proposalType;
        proposal.proposer = msg.sender;
        proposal.target = target;
        proposal.value = value;
        proposal.data = data;
        proposal.description = description;
        proposal.status = ProposalStatus.PENDING;
        proposal.creationTime = block.timestamp;
        proposal.executionTime = 0;
        proposal.approvalCount = 0;
        
        // Auto-approve by proposer
        proposal.approvals[msg.sender] = true;
        proposal.approvalCount++;
        
        emit ProposalCreated(proposalCounter, proposalType, msg.sender, description, block.timestamp);
        return proposalCounter;
    }

    function approveProposal(uint256 proposalId) public {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.PENDING, "Proposal not pending");
        require(isSigner(msg.sender), "Not a signer");
        require(!proposal.approvals[msg.sender], "Already approved");
        
        proposal.approvals[msg.sender] = true;
        proposal.approvalCount++;
        
        emit ProposalApproved(proposalId, msg.sender, proposal.approvalCount, block.timestamp);
        
        // Auto-execute if enough approvals
        if (proposal.approvalCount >= requiredSignatures) {
            _executeProposal(proposalId);
        }
    }

    function executeProposal(uint256 proposalId) public {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.APPROVED, "Proposal not approved");
        require(block.timestamp >= proposal.creationTime + PROPOSAL_TIMELOCK, "Timelock not passed");
        
        _executeProposal(proposalId);
    }

    function _executeProposal(uint256 proposalId) internal {
        Proposal storage proposal = proposals[proposalId];
        
        (bool success, ) = proposal.target.call{value: proposal.value}(proposal.data);
        require(success, "Proposal execution failed");
        
        proposal.status = ProposalStatus.EXECUTED;
        proposal.executionTime = block.timestamp;
        
        emit ProposalExecuted(proposalId, msg.sender, block.timestamp);
    }

    function rejectProposal(uint256 proposalId) public onlyRole(DEFAULT_ADMIN_ROLE) {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.PENDING, "Proposal not pending");
        
        proposal.status = ProposalStatus.REJECTED;
        
        emit ProposalRejected(proposalId, msg.sender, block.timestamp);
    }

    function addSigner(address newSigner) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(signers.length < MAX_SIGNERS, "Max signers reached");
        require(!isSigner(newSigner), "Already a signer");
        
        _addSigner(newSigner);
        
        emit SignerAdded(newSigner, msg.sender, block.timestamp);
    }

    function removeSigner(address signer) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(isSigner(signer), "Not a signer");
        require(signers.length > 1, "Cannot remove last signer");
        require(requiredSignatures <= signers.length - 1, "Required signatures too high");
        
        for (uint256 i = 0; i < signers.length; i++) {
            if (signers[i] == signer) {
                signers[i] = signers[signers.length - 1];
                signers.pop();
                break;
            }
        }
        
        emit SignerRemoved(signer, msg.sender, block.timestamp);
    }

    function _addSigner(address signer) internal {
        signers.push(signer);
        _grantRole(PROPOSER_ROLE, signer);
    }

    function isSigner(address account) public view returns (bool) {
        for (uint256 i = 0; i < signers.length; i++) {
            if (signers[i] == account) {
                return true;
            }
        }
        return false;
    }

    function getSigners() public view returns (address[] memory) {
        return signers;
    }

    function getProposalApprovals(uint256 proposalId) public view returns (address[] memory) {
        Proposal storage proposal = proposals[proposalId];
        address[] memory approvers = new address[](proposal.approvalCount);
        uint256 count = 0;
        
        for (uint256 i = 0; i < signers.length; i++) {
            if (proposal.approvals[signers[i]]) {
                approvers[count] = signers[i];
                count++;
            }
        }
        
        return approvers;
    }

    function getPendingProposals() public view returns (uint256[] memory) {
        uint256 pendingCount = 0;
        for (uint256 i = 1; i <= proposalCounter; i++) {
            if (proposals[i].status == ProposalStatus.PENDING) {
                pendingCount++;
            }
        }
        
        uint256[] memory pendingProposals = new uint256[](pendingCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 1; i <= proposalCounter; i++) {
            if (proposals[i].status == ProposalStatus.PENDING) {
                pendingProposals[currentIndex] = i;
                currentIndex++;
            }
        }
        
        return pendingProposals;
    }

    // Emergency function to recover funds
    function emergencyRecover(address token, uint256 amount) public onlyRole(DEFAULT_ADMIN_ROLE) {
        if (token == address(0)) {
            payable(msg.sender).transfer(amount);
        } else {
            // IERC20(token).transfer(msg.sender, amount);
        }
    }

    receive() external payable {}
}