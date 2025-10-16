// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title DeedChainBackup
 * @dev Emergency backup and recovery system for critical DeedChain data
 */
contract DeedChainBackup is AccessControl {
    bytes32 public constant BACKUP_OPERATOR_ROLE = keccak256("BACKUP_OPERATOR_ROLE");
    bytes32 public constant RECOVERY_AGENT_ROLE = keccak256("RECOVERY_AGENT_ROLE");
    
    struct DataSnapshot {
        uint256 snapshotId;
        bytes32 dataHash;
        string ipfsHash;
        uint256 timestamp;
        address createdBy;
        string description;
        bool verified;
    }
    
    struct EmergencyRecovery {
        uint256 recoveryId;
        address initiatedBy;
        uint256 initiationTime;
        uint256 executionTime;
        bool executed;
        bytes32 newStateHash;
        string recoveryPlan;
    }
    
    mapping(uint256 => DataSnapshot) public dataSnapshots;
    mapping(uint256 => EmergencyRecovery) public emergencyRecoveries;
    mapping(bytes32 => bool) public verifiedHashes;
    
    uint256 public snapshotCounter;
    uint256 public recoveryCounter;
    uint256 public constant RECOVERY_DELAY = 2 days;
    
    event SnapshotCreated(
        uint256 indexed snapshotId,
        bytes32 dataHash,
        string ipfsHash,
        string description,
        address indexed createdBy,
        uint256 timestamp
    );
    
    event SnapshotVerified(
        uint256 indexed snapshotId,
        address verifiedBy,
        uint256 timestamp
    );
    
    event RecoveryInitiated(
        uint256 indexed recoveryId,
        address indexed initiatedBy,
        string recoveryPlan,
        uint256 executionTime,
        uint256 timestamp
    );
    
    event RecoveryExecuted(
        uint256 indexed recoveryId,
        address indexed executedBy,
        bytes32 newStateHash,
        uint256 timestamp
    );

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(BACKUP_OPERATOR_ROLE, msg.sender);
        _grantRole(RECOVERY_AGENT_ROLE, msg.sender);
    }

    function createSnapshot(
        bytes32 dataHash,
        string memory ipfsHash,
        string memory description
    ) public onlyRole(BACKUP_OPERATOR_ROLE) returns (uint256) {
        require(dataHash != bytes32(0), "Invalid data hash");
        require(bytes(ipfsHash).length > 0, "IPFS hash required");
        
        snapshotCounter++;
        
        dataSnapshots[snapshotCounter] = DataSnapshot({
            snapshotId: snapshotCounter,
            dataHash: dataHash,
            ipfsHash: ipfsHash,
            timestamp: block.timestamp,
            createdBy: msg.sender,
            description: description,
            verified: false
        });
        
        emit SnapshotCreated(
            snapshotCounter,
            dataHash,
            ipfsHash,
            description,
            msg.sender,
            block.timestamp
        );
        
        return snapshotCounter;
    }

    function verifySnapshot(uint256 snapshotId) public onlyRole(BACKUP_OPERATOR_ROLE) {
        DataSnapshot storage snapshot = dataSnapshots[snapshotId];
        require(snapshot.snapshotId != 0, "Snapshot not found");
        require(!snapshot.verified, "Snapshot already verified");
        
        snapshot.verified = true;
        verifiedHashes[snapshot.dataHash] = true;
        
        emit SnapshotVerified(snapshotId, msg.sender, block.timestamp);
    }

    function initiateEmergencyRecovery(
        bytes32 newStateHash,
        string memory recoveryPlan
    ) public onlyRole(RECOVERY_AGENT_ROLE) returns (uint256) {
        recoveryCounter++;
        
        uint256 executionTime = block.timestamp + RECOVERY_DELAY;
        
        emergencyRecoveries[recoveryCounter] = EmergencyRecovery({
            recoveryId: recoveryCounter,
            initiatedBy: msg.sender,
            initiationTime: block.timestamp,
            executionTime: executionTime,
            executed: false,
            newStateHash: newStateHash,
            recoveryPlan: recoveryPlan
        });
        
        emit RecoveryInitiated(
            recoveryCounter,
            msg.sender,
            recoveryPlan,
            executionTime,
            block.timestamp
        );
        
        return recoveryCounter;
    }

    function executeEmergencyRecovery(uint256 recoveryId) public onlyRole(RECOVERY_AGENT_ROLE) {
        EmergencyRecovery storage recovery = emergencyRecoveries[recoveryId];
        require(recovery.recoveryId != 0, "Recovery not found");
        require(!recovery.executed, "Recovery already executed");
        require(block.timestamp >= recovery.executionTime, "Recovery delay not passed");
        
        recovery.executed = true;
        
        // In a real implementation, this would restore system state
        // This could involve updating contract storage, minting replacement NFTs, etc.
        
        emit RecoveryExecuted(recoveryId, msg.sender, recovery.newStateHash, block.timestamp);
    }

    function cancelEmergencyRecovery(uint256 recoveryId) public onlyRole(DEFAULT_ADMIN_ROLE) {
        EmergencyRecovery storage recovery = emergencyRecoveries[recoveryId];
        require(!recovery.executed, "Recovery already executed");
        
        delete emergencyRecoveries[recoveryId];
    }

    function getLatestVerifiedSnapshot() public view returns (DataSnapshot memory) {
        for (uint256 i = snapshotCounter; i > 0; i--) {
            if (dataSnapshots[i].verified) {
                return dataSnapshots[i];
            }
        }
        revert("No verified snapshots found");
    }

    function isDataVerified(bytes32 dataHash) public view returns (bool) {
        return verifiedHashes[dataHash];
    }

    function getPendingRecoveries() public view returns (uint256[] memory) {
        uint256 pendingCount = 0;
        for (uint256 i = 1; i <= recoveryCounter; i++) {
            if (emergencyRecoveries[i].recoveryId != 0 && !emergencyRecoveries[i].executed) {
                pendingCount++;
            }
        }
        
        uint256[] memory pendingRecoveries = new uint256[](pendingCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 1; i <= recoveryCounter; i++) {
            if (emergencyRecoveries[i].recoveryId != 0 && !emergencyRecoveries[i].executed) {
                pendingRecoveries[currentIndex] = i;
                currentIndex++;
            }
        }
        
        return pendingRecoveries;
    }

    function verifyDataIntegrity(
        bytes32 expectedHash,
        bytes32 actualHash
    ) public pure returns (bool) {
        return expectedHash == actualHash;
    }

    // Emergency function to force recovery (bypasses delay)
    function forceEmergencyRecovery(
        uint256 recoveryId,
        bytes32 newStateHash
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        EmergencyRecovery storage recovery = emergencyRecoveries[recoveryId];
        require(!recovery.executed, "Recovery already executed");
        
        recovery.executed = true;
        recovery.newStateHash = newStateHash;
        recovery.executionTime = block.timestamp;
        
        emit RecoveryExecuted(recoveryId, msg.sender, newStateHash, block.timestamp);
    }
}