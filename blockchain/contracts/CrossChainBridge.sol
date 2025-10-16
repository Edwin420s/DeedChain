// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./DeedNFT.sol";

/**
 * @title CrossChainBridge
 * @dev Cross-chain bridge for DeedNFT properties between Linea and other chains
 */
contract CrossChainBridge is AccessControl, ReentrancyGuard {
    bytes32 public constant BRIDGE_OPERATOR_ROLE = keccak256("BRIDGE_OPERATOR_ROLE");
    bytes32 public constant VALIDATOR_ROLE = keccak256("VALIDATOR_ROLE");
    
    DeedNFT public deedNFT;
    
    enum BridgeStatus { PENDING, CONFIRMED, REJECTED, COMPLETED }
    
    struct BridgeRequest {
        uint256 requestId;
        uint256 propertyId;
        address owner;
        uint256 targetChainId;
        address targetContract;
        BridgeStatus status;
        uint256 createdTime;
        uint256 confirmedTime;
        bytes32 crossChainTxHash;
        address validatedBy;
    }
    
    mapping(uint256 => BridgeRequest) public bridgeRequests;
    mapping(uint256 => uint256[]) public userBridgeRequests;
    mapping(bytes32 => bool) public processedTransactions;
    
    uint256 public requestCounter;
    uint256 public constant BRIDGE_FEE = 0.001 ether;
    uint256 public constant MIN_CONFIRMATIONS = 2;
    
    // Supported chains
    mapping(uint256 => bool) public supportedChains;
    mapping(uint256 => address) public chainContracts;
    
    event BridgeRequestCreated(
        uint256 indexed requestId,
        uint256 indexed propertyId,
        address indexed owner,
        uint256 targetChainId,
        uint256 timestamp
    );
    
    event BridgeRequestConfirmed(
        uint256 indexed requestId,
        address indexed validator,
        bytes32 crossChainTxHash,
        uint256 timestamp
    );
    
    event BridgeCompleted(
        uint256 indexed requestId,
        uint256 indexed propertyId,
        address indexed owner,
        uint256 targetChainId,
        uint256 timestamp
    );
    
    event ChainSupportUpdated(
        uint256 chainId,
        bool supported,
        address contractAddress,
        uint256 timestamp
    );

    constructor(address _deedNFT) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(BRIDGE_OPERATOR_ROLE, msg.sender);
        _grantRole(VALIDATOR_ROLE, msg.sender);
        
        deedNFT = DeedNFT(_deedNFT);
        
        // Support Linea mainnet by default
        supportedChains[59144] = true;
    }

    function createBridgeRequest(
        uint256 propertyId,
        uint256 targetChainId,
        address targetContract
    ) public payable nonReentrant returns (uint256) {
        require(msg.value >= BRIDGE_FEE, "Insufficient bridge fee");
        require(deedNFT.ownerOf(propertyId) == msg.sender, "Not property owner");
        require(supportedChains[targetChainId], "Target chain not supported");
        require(deedNFT.getPropertyInfo(propertyId).isVerified, "Property not verified");
        
        // Lock NFT in bridge contract
        deedNFT.transferFrom(msg.sender, address(this), propertyId);
        
        requestCounter++;
        
        bridgeRequests[requestCounter] = BridgeRequest({
            requestId: requestCounter,
            propertyId: propertyId,
            owner: msg.sender,
            targetChainId: targetChainId,
            targetContract: targetContract,
            status: BridgeStatus.PENDING,
            createdTime: block.timestamp,
            confirmedTime: 0,
            crossChainTxHash: bytes32(0),
            validatedBy: address(0)
        });
        
        userBridgeRequests[propertyId].push(requestCounter);
        
        // Refund excess fee
        if (msg.value > BRIDGE_FEE) {
            payable(msg.sender).transfer(msg.value - BRIDGE_FEE);
        }
        
        emit BridgeRequestCreated(requestCounter, propertyId, msg.sender, targetChainId, block.timestamp);
        return requestCounter;
    }

    function confirmBridgeRequest(
        uint256 requestId,
        bytes32 crossChainTxHash
    ) public onlyRole(VALIDATOR_ROLE) {
        BridgeRequest storage request = bridgeRequests[requestId];
        require(request.status == BridgeStatus.PENDING, "Request not pending");
        require(!processedTransactions[crossChainTxHash], "Transaction already processed");
        
        request.status = BridgeStatus.CONFIRMED;
        request.confirmedTime = block.timestamp;
        request.crossChainTxHash = crossChainTxHash;
        request.validatedBy = msg.sender;
        
        processedTransactions[crossChainTxHash] = true;
        
        emit BridgeRequestConfirmed(requestId, msg.sender, crossChainTxHash, block.timestamp);
    }

    function completeBridgeRequest(uint256 requestId) public nonReentrant {
        BridgeRequest storage request = bridgeRequests[requestId];
        require(request.status == BridgeStatus.CONFIRMED, "Request not confirmed");
        require(request.owner == msg.sender, "Not request owner");
        
        // In a real implementation, this would mint on target chain
        // For now, we just return the NFT to owner (simulating failed bridge)
        deedNFT.transferFrom(address(this), msg.sender, request.propertyId);
        
        request.status = BridgeStatus.COMPLETED;
        
        emit BridgeCompleted(requestId, request.propertyId, msg.sender, request.targetChainId, block.timestamp);
    }

    function addSupportedChain(
        uint256 chainId,
        address contractAddress
    ) public onlyRole(BRIDGE_OPERATOR_ROLE) {
        supportedChains[chainId] = true;
        chainContracts[chainId] = contractAddress;
        
        emit ChainSupportUpdated(chainId, true, contractAddress, block.timestamp);
    }

    function removeSupportedChain(uint256 chainId) public onlyRole(BRIDGE_OPERATOR_ROLE) {
        supportedChains[chainId] = false;
        
        emit ChainSupportUpdated(chainId, false, address(0), block.timestamp);
    }

    function getBridgeRequestsByProperty(uint256 propertyId) public view returns (uint256[] memory) {
        return userBridgeRequests[propertyId];
    }

    function getPendingRequests() public view returns (uint256[] memory) {
        uint256 pendingCount = 0;
        for (uint256 i = 1; i <= requestCounter; i++) {
            if (bridgeRequests[i].status == BridgeStatus.PENDING) {
                pendingCount++;
            }
        }
        
        uint256[] memory pendingRequests = new uint256[](pendingCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 1; i <= requestCounter; i++) {
            if (bridgeRequests[i].status == BridgeStatus.PENDING) {
                pendingRequests[currentIndex] = i;
                currentIndex++;
            }
        }
        
        return pendingRequests;
    }

    function estimateBridgeFee(uint256 targetChainId) public pure returns (uint256) {
        // Different chains could have different fees
        if (targetChainId == 137) { // Polygon
            return BRIDGE_FEE * 120 / 100; // 20% more
        } else if (targetChainId == 1) { // Ethereum
            return BRIDGE_FEE * 200 / 100; // 2x more
        }
        return BRIDGE_FEE;
    }

    // Emergency function to return NFT if bridge fails
    function emergencyReturnNFT(uint256 requestId) public onlyRole(DEFAULT_ADMIN_ROLE) {
        BridgeRequest storage request = bridgeRequests[requestId];
        require(request.status == BridgeStatus.PENDING || request.status == BridgeStatus.CONFIRMED, 
                "Invalid request status");
        
        deedNFT.transferFrom(address(this), request.owner, request.propertyId);
        request.status = BridgeStatus.REJECTED;
    }

    function withdrawFees(address to) public onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 balance = address(this).balance;
        payable(to).transfer(balance);
    }
}