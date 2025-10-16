// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/governance/TimelockController.sol";

/**
 * @title DeedChainTimelock
 * @dev Timelock controller for DAO governance proposals
 */
contract DeedChainTimelock is TimelockController {
    constructor(
        uint256 minDelay,
        address[] memory proposers,
        address[] memory executors,
        address admin
    ) TimelockController(minDelay, proposers, executors, admin) {}
    
    /**
     * @dev Schedule an operation containing a single transaction.
     */
    function schedule(
        address target,
        uint256 value,
        bytes calldata data,
        bytes32 predecessor,
        bytes32 salt,
        uint256 delay
    ) public virtual override {
        super.schedule(target, value, data, predecessor, salt, delay);
    }
    
    /**
     * @dev Execute an (ready) operation containing a single transaction.
     */
    function execute(
        address target,
        uint256 value,
        bytes calldata data,
        bytes32 predecessor,
        bytes32 salt
    ) public payable virtual override {
        super.execute(target, value, data, predecessor, salt);
    }
    
    /**
     * @dev Get operation state.
     */
    function getOperationState(bytes32 id) public view returns (OperationState) {
        return super.getOperationState(id);
    }
    
    /**
     * @dev Check if operation is pending.
     */
    function isOperationPending(bytes32 id) public view returns (bool) {
        return super.isOperationPending(id);
    }
    
    /**
     * @dev Check if operation is ready.
     */
    function isOperationReady(bytes32 id) public view returns (bool) {
        return super.isOperationReady(id);
    }
    
    /**
     * @dev Check if operation is done.
     */
    function isOperationDone(bytes32 id) public view returns (bool) {
        return super.isOperationDone(id);
    }
}