// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./DeedNFT.sol";

/**
 * @title DisputeResolution
 * @dev Handles property ownership disputes and arbitration
 */
contract DisputeResolution is AccessControl {
    bytes32 public constant ARBITRATOR_ROLE = keccak256("ARBITRATOR_ROLE");
    bytes32 public constant DISPUTE_MANAGER_ROLE = keccak256("DISPUTE_MANAGER_ROLE");
    
    DeedNFT public deedNFT;
    
    enum DisputeStatus { PENDING, UNDER_REVIEW, RESOLVED, CANCELLED }
    enum DisputeType { OWNERSHIP_CLAIM, BOUNDARY_DISPUTE, FRAUD_CLAIM }
    
    struct Dispute {
        uint256 disputeId;
        uint256 propertyId;
        address complainant;
        DisputeType disputeType;
        DisputeStatus status;
        string description;
        string evidenceIPFS;
        uint256 createdDate;
        uint256 resolvedDate;
        address resolvedBy;
        string resolution;
        bool propertyFrozen;
    }
    
    mapping(uint256 => Dispute) public disputes;
    mapping(uint256 => uint256[]) public propertyDisputes;
    mapping(uint256 => bool) public frozenProperties;
    
    uint256 public disputeCounter;
    uint256 public constant DISPUTE_RESOLUTION_TIME = 30 days;
    
    event DisputeFiled(
        uint256 indexed disputeId,
        uint256 indexed propertyId,
        address indexed complainant,
        DisputeType disputeType,
        string description,
        uint256 timestamp
    );
    
    event DisputeResolved(
        uint256 indexed disputeId,
        uint256 indexed propertyId,
        address resolvedBy,
        string resolution,
        uint256 timestamp
    );
    
    event PropertyFrozen(
        uint256 indexed propertyId,
        uint256 indexed disputeId,
        uint256 timestamp
    );
    
    event PropertyUnfrozen(
        uint256 indexed propertyId,
        uint256 indexed disputeId,
        uint256 timestamp
    );

    constructor(address deedNFTAddress) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ARBITRATOR_ROLE, msg.sender);
        _grantRole(DISPUTE_MANAGER_ROLE, msg.sender);
        deedNFT = DeedNFT(deedNFTAddress);
    }

    function fileDispute(
        uint256 propertyId,
        DisputeType disputeType,
        string memory description,
        string memory evidenceIPFS
    ) public returns (uint256) {
        require(deedNFT.exists(propertyId), "Property does not exist");
        require(bytes(description).length > 0, "Description required");
        require(bytes(evidenceIPFS).length > 0, "Evidence required");
        
        disputeCounter++;
        
        disputes[disputeCounter] = Dispute({
            disputeId: disputeCounter,
            propertyId: propertyId,
            complainant: msg.sender,
            disputeType: disputeType,
            status: DisputeStatus.PENDING,
            description: description,
            evidenceIPFS: evidenceIPFS,
            createdDate: block.timestamp,
            resolvedDate: 0,
            resolvedBy: address(0),
            resolution: "",
            propertyFrozen: false
        });
        
        propertyDisputes[propertyId].push(disputeCounter);
        
        // Automatically freeze property for serious disputes
        if (disputeType == DisputeType.FRAUD_CLAIM) {
            _freezeProperty(propertyId, disputeCounter);
        }
        
        emit DisputeFiled(disputeCounter, propertyId, msg.sender, disputeType, description, block.timestamp);
        return disputeCounter;
    }

    function reviewDispute(uint256 disputeId) public onlyRole(DISPUTE_MANAGER_ROLE) {
        Dispute storage dispute = disputes[disputeId];
        require(dispute.status == DisputeStatus.PENDING, "Dispute not pending");
        
        dispute.status = DisputeStatus.UNDER_REVIEW;
        
        // Freeze property during review
        if (!dispute.propertyFrozen) {
            _freezeProperty(dispute.propertyId, disputeId);
        }
    }

    function resolveDispute(
        uint256 disputeId,
        string memory resolution,
        bool unfreezeProperty
    ) public onlyRole(ARBITRATOR_ROLE) {
        Dispute storage dispute = disputes[disputeId];
        require(dispute.status == DisputeStatus.UNDER_REVIEW, "Dispute not under review");
        require(bytes(resolution).length > 0, "Resolution required");
        
        dispute.status = DisputeStatus.RESOLVED;
        dispute.resolvedDate = block.timestamp;
        dispute.resolvedBy = msg.sender;
        dispute.resolution = resolution;
        
        if (unfreezeProperty && dispute.propertyFrozen) {
            _unfreezeProperty(dispute.propertyId, disputeId);
        }
        
        emit DisputeResolved(disputeId, dispute.propertyId, msg.sender, resolution, block.timestamp);
    }

    function freezeProperty(uint256 propertyId, uint256 disputeId) public onlyRole(DISPUTE_MANAGER_ROLE) {
        _freezeProperty(propertyId, disputeId);
    }

    function unfreezeProperty(uint256 propertyId, uint256 disputeId) public onlyRole(ARBITRATOR_ROLE) {
        _unfreezeProperty(propertyId, disputeId);
    }

    function _freezeProperty(uint256 propertyId, uint256 disputeId) internal {
        frozenProperties[propertyId] = true;
        disputes[disputeId].propertyFrozen = true;
        
        emit PropertyFrozen(propertyId, disputeId, block.timestamp);
    }

    function _unfreezeProperty(uint256 propertyId, uint256 disputeId) internal {
        frozenProperties[propertyId] = false;
        disputes[disputeId].propertyFrozen = false;
        
        emit PropertyUnfrozen(propertyId, disputeId, block.timestamp);
    }

    function isPropertyFrozen(uint256 propertyId) public view returns (bool) {
        return frozenProperties[propertyId];
    }

    function getPropertyDisputes(uint256 propertyId) public view returns (uint256[] memory) {
        return propertyDisputes[propertyId];
    }

    function getActiveDisputes() public view returns (uint256[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 1; i <= disputeCounter; i++) {
            if (disputes[i].status == DisputeStatus.PENDING || disputes[i].status == DisputeStatus.UNDER_REVIEW) {
                activeCount++;
            }
        }
        
        uint256[] memory activeDisputes = new uint256[](activeCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 1; i <= disputeCounter; i++) {
            if (disputes[i].status == DisputeStatus.PENDING || disputes[i].status == DisputeStatus.UNDER_REVIEW) {
                activeDisputes[currentIndex] = i;
                currentIndex++;
            }
        }
        
        return activeDisputes;
    }
}