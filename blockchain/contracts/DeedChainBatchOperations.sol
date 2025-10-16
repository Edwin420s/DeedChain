// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./DeedNFT.sol";
import "./TokenizationManager.sol";

/**
 * @title DeedChainBatchOperations
 * @dev Batch processing for bulk property operations
 */
contract DeedChainBatchOperations is AccessControl, ReentrancyGuard {
    bytes32 public constant BATCH_OPERATOR_ROLE = keccak256("BATCH_OPERATOR_ROLE");
    
    DeedNFT public deedNFT;
    TokenizationManager public tokenizationManager;
    
    struct BatchOperation {
        uint256 operationId;
        address initiator;
        uint256 totalItems;
        uint256 processedItems;
        uint256 failedItems;
        bool completed;
        uint256 startTime;
        uint256 endTime;
        string operationType;
    }
    
    struct PropertyRegistrationBatch {
        uint256 operationId;
        address[] owners;
        string[] ipfsHashes;
        string[] geoCoordinates;
        uint256[] areaSizes;
        string[] surveyNumbers;
        uint256[] tokenIds;
    }
    
    struct TokenizationBatch {
        uint256 operationId;
        uint256[] propertyIds;
        string[] tokenNames;
        string[] tokenSymbols;
        uint256[] totalShares;
        address[] landShareTokens;
    }
    
    mapping(uint256 => BatchOperation) public batchOperations;
    mapping(uint256 => PropertyRegistrationBatch) public registrationBatches;
    mapping(uint256 => TokenizationBatch) public tokenizationBatches;
    mapping(address => uint256[]) public userBatchOperations;
    
    uint256 public operationCounter;
    uint256 public constant MAX_BATCH_SIZE = 100;
    
    event BatchOperationStarted(
        uint256 indexed operationId,
        address indexed initiator,
        string operationType,
        uint256 totalItems,
        uint256 timestamp
    );
    
    event BatchOperationCompleted(
        uint256 indexed operationId,
        address indexed initiator,
        uint256 processedItems,
        uint256 failedItems,
        uint256 timestamp
    );
    
    event BatchItemProcessed(
        uint256 indexed operationId,
        uint256 itemIndex,
        bool success,
        string result,
        uint256 timestamp
    );

    constructor(address _deedNFT, address _tokenizationManager) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(BATCH_OPERATOR_ROLE, msg.sender);
        
        deedNFT = DeedNFT(_deedNFT);
        tokenizationManager = TokenizationManager(_tokenizationManager);
    }

    function batchRegisterProperties(
        address[] memory owners,
        string[] memory ipfsHashes,
        string[] memory geoCoordinates,
        uint256[] memory areaSizes,
        string[] memory surveyNumbers
    ) public onlyRole(BATCH_OPERATOR_ROLE) returns (uint256) {
        require(owners.length <= MAX_BATCH_SIZE, "Batch size too large");
        require(owners.length == ipfsHashes.length, "Arrays length mismatch");
        require(owners.length == geoCoordinates.length, "Arrays length mismatch");
        require(owners.length == areaSizes.length, "Arrays length mismatch");
        require(owners.length == surveyNumbers.length, "Arrays length mismatch");
        
        operationCounter++;
        
        BatchOperation storage operation = batchOperations[operationCounter];
        operation.operationId = operationCounter;
        operation.initiator = msg.sender;
        operation.totalItems = owners.length;
        operation.operationType = "PROPERTY_REGISTRATION";
        operation.startTime = block.timestamp;
        
        PropertyRegistrationBatch storage batch = registrationBatches[operationCounter];
        batch.operationId = operationCounter;
        batch.owners = owners;
        batch.ipfsHashes = ipfsHashes;
        batch.geoCoordinates = geoCoordinates;
        batch.areaSizes = areaSizes;
        batch.surveyNumbers = surveyNumbers;
        batch.tokenIds = new uint256[](owners.length);
        
        userBatchOperations[msg.sender].push(operationCounter);
        
        // Process batch
        _processRegistrationBatch(operationCounter);
        
        emit BatchOperationStarted(operationCounter, msg.sender, "PROPERTY_REGISTRATION", owners.length, block.timestamp);
        
        return operationCounter;
    }

    function _processRegistrationBatch(uint256 operationId) internal {
        BatchOperation storage operation = batchOperations[operationId];
        PropertyRegistrationBatch storage batch = registrationBatches[operationId];
        
        for (uint256 i = 0; i < batch.owners.length; i++) {
            try deedNFT.registerProperty(
                batch.owners[i],
                batch.ipfsHashes[i],
                batch.geoCoordinates[i],
                batch.areaSizes[i],
                batch.surveyNumbers[i]
            ) returns (uint256 tokenId) {
                batch.tokenIds[i] = tokenId;
                operation.processedItems++;
                
                emit BatchItemProcessed(operationId, i, true, "Success", block.timestamp);
            } catch Error(string memory reason) {
                operation.failedItems++;
                batch.tokenIds[i] = 0;
                
                emit BatchItemProcessed(operationId, i, false, reason, block.timestamp);
            } catch {
                operation.failedItems++;
                batch.tokenIds[i] = 0;
                
                emit BatchItemProcessed(operationId, i, false, "Unknown error", block.timestamp);
            }
        }
        
        operation.completed = true;
        operation.endTime = block.timestamp;
        
        emit BatchOperationCompleted(operationId, operation.initiator, operation.processedItems, operation.failedItems, block.timestamp);
    }

    function batchTokenizeProperties(
        uint256[] memory propertyIds,
        string[] memory tokenNames,
        string[] memory tokenSymbols,
        uint256[] memory totalShares
    ) public onlyRole(BATCH_OPERATOR_ROLE) returns (uint256) {
        require(propertyIds.length <= MAX_BATCH_SIZE, "Batch size too large");
        require(propertyIds.length == tokenNames.length, "Arrays length mismatch");
        require(propertyIds.length == tokenSymbols.length, "Arrays length mismatch");
        require(propertyIds.length == totalShares.length, "Arrays length mismatch");
        
        operationCounter++;
        
        BatchOperation storage operation = batchOperations[operationCounter];
        operation.operationId = operationCounter;
        operation.initiator = msg.sender;
        operation.totalItems = propertyIds.length;
        operation.operationType = "PROPERTY_TOKENIZATION";
        operation.startTime = block.timestamp;
        
        TokenizationBatch storage batch = tokenizationBatches[operationCounter];
        batch.operationId = operationCounter;
        batch.propertyIds = propertyIds;
        batch.tokenNames = tokenNames;
        batch.tokenSymbols = tokenSymbols;
        batch.totalShares = totalShares;
        batch.landShareTokens = new address[](propertyIds.length);
        
        userBatchOperations[msg.sender].push(operationCounter);
        
        // Process batch (this would be more complex in reality)
        _processTokenizationBatch(operationCounter);
        
        emit BatchOperationStarted(operationCounter, msg.sender, "PROPERTY_TOKENIZATION", propertyIds.length, block.timestamp);
        
        return operationCounter;
    }

    function _processTokenizationBatch(uint256 operationId) internal {
        BatchOperation storage operation = batchOperations[operationId];
        TokenizationBatch storage batch = tokenizationBatches[operationId];
        
        for (uint256 i = 0; i < batch.propertyIds.length; i++) {
            try tokenizationManager.tokenizeProperty(
                batch.propertyIds[i],
                batch.tokenNames[i],
                batch.tokenSymbols[i],
                batch.totalShares[i]
            ) returns (address landShareToken) {
                batch.landShareTokens[i] = landShareToken;
                operation.processedItems++;
                
                emit BatchItemProcessed(operationId, i, true, "Success", block.timestamp);
            } catch Error(string memory reason) {
                operation.failedItems++;
                batch.landShareTokens[i] = address(0);
                
                emit BatchItemProcessed(operationId, i, false, reason, block.timestamp);
            } catch {
                operation.failedItems++;
                batch.landShareTokens[i] = address(0);
                
                emit BatchItemProcessed(operationId, i, false, "Unknown error", block.timestamp);
            }
        }
        
        operation.completed = true;
        operation.endTime = block.timestamp;
        
        emit BatchOperationCompleted(operationId, operation.initiator, operation.processedItems, operation.failedItems, block.timestamp);
    }

    function getBatchOperation(uint256 operationId) public view returns (BatchOperation memory) {
        return batchOperations[operationId];
    }

    function getRegistrationBatchResults(uint256 operationId) public view returns (PropertyRegistrationBatch memory) {
        return registrationBatches[operationId];
    }

    function getTokenizationBatchResults(uint256 operationId) public view returns (TokenizationBatch memory) {
        return tokenizationBatches[operationId];
    }

    function getUserBatchOperations(address user) public view returns (uint256[] memory) {
        return userBatchOperations[user];
    }

    function getOperationStatus(uint256 operationId) public view returns (string memory) {
        BatchOperation memory operation = batchOperations[operationId];
        
        if (operation.operationId == 0) return "NOT_FOUND";
        if (!operation.completed) return "IN_PROGRESS";
        if (operation.failedItems == operation.totalItems) return "FAILED";
        if (operation.failedItems > 0) return "PARTIAL_SUCCESS";
        return "COMPLETED";
    }

    function estimateBatchGas(
        uint256 batchSize,
        string memory operationType
    ) public pure returns (uint256) {
        // Simplified gas estimation
        if (keccak256(abi.encodePacked(operationType)) == keccak256(abi.encodePacked("PROPERTY_REGISTRATION"))) {
            return batchSize * 150000; // 150k gas per registration
        } else if (keccak256(abi.encodePacked(operationType)) == keccak256(abi.encodePacked("PROPERTY_TOKENIZATION"))) {
            return batchSize * 250000; // 250k gas per tokenization
        }
        
        return batchSize * 100000; // Default estimate
    }
}