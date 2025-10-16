// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./DeedNFT.sol";

/**
 * @title LandRegistry
 * @dev Main registry contract managing property lifecycle and transfers
 */
contract LandRegistry is AccessControl {
    bytes32 public constant TRANSFER_APPROVER_ROLE = keccak256("TRANSFER_APPROVER_ROLE");
    
    DeedNFT public deedNFT;
    
    struct TransferRequest {
        uint256 propertyId;
        address from;
        address to;
        uint256 requestTimestamp;
        bool approved;
        bool executed;
    }
    
    mapping(uint256 => TransferRequest) public transferRequests;
    uint256[] public pendingTransferIds;
    
    event TransferInitiated(
        uint256 indexed requestId,
        uint256 indexed propertyId,
        address from,
        address to,
        uint256 timestamp
    );
    
    event TransferApproved(
        uint256 indexed requestId,
        uint256 indexed propertyId,
        address approvedBy
    );
    
    event TransferCompleted(
        uint256 indexed requestId,
        uint256 indexed propertyId,
        address from,
        address to,
        uint256 timestamp
    );

    constructor(address deedNFTAddress) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(TRANSFER_APPROVER_ROLE, msg.sender);
        deedNFT = DeedNFT(deedNFTAddress);
    }

    function initiateTransfer(
        uint256 propertyId,
        address to
    ) public returns (uint256) {
        require(deedNFT.ownerOf(propertyId) == msg.sender, "Not property owner");
        require(deedNFT.getPropertyInfo(propertyId).isVerified, "Property not verified");
        
        uint256 requestId = uint256(keccak256(abi.encodePacked(propertyId, msg.sender, to, block.timestamp)));
        
        transferRequests[requestId] = TransferRequest({
            propertyId: propertyId,
            from: msg.sender,
            to: to,
            requestTimestamp: block.timestamp,
            approved: false,
            executed: false
        });
        
        pendingTransferIds.push(requestId);
        
        emit TransferInitiated(requestId, propertyId, msg.sender, to, block.timestamp);
        return requestId;
    }

    function approveTransfer(uint256 requestId) public onlyRole(TRANSFER_APPROVER_ROLE) {
        TransferRequest storage request = transferRequests[requestId];
        require(request.from != address(0), "Transfer request not found");
        require(!request.approved, "Transfer already approved");
        require(!request.executed, "Transfer already executed");
        
        request.approved = true;
        emit TransferApproved(requestId, request.propertyId, msg.sender);
    }

    function executeTransfer(uint256 requestId) public {
        TransferRequest storage request = transferRequests[requestId];
        require(request.from != address(0), "Transfer request not found");
        require(request.approved, "Transfer not approved");
        require(!request.executed, "Transfer already executed");
        require(msg.sender == request.from, "Only initiator can execute");
        
        deedNFT.safeTransferFrom(request.from, request.to, request.propertyId);
        request.executed = true;
        
        emit TransferCompleted(requestId, request.propertyId, request.from, request.to, block.timestamp);
    }

    function getPendingTransfers() public view returns (uint256[] memory) {
        return pendingTransferIds;
    }

    function getTransferRequest(uint256 requestId) public view returns (TransferRequest memory) {
        return transferRequests[requestId];
    }
}