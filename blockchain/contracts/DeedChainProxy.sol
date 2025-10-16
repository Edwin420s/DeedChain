// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

/**
 * @title DeedChainProxy
 * @dev Proxy contract for DeedChain upgradeable contracts
 */
contract DeedChainProxy is ERC1967Proxy {
    constructor(address _logic, bytes memory _data) ERC1967Proxy(_logic, _data) {}
    
    /**
     * @dev Returns the current implementation address.
     */
    function getImplementation() public view returns (address) {
        return _implementation();
    }
    
    /**
     * @dev Returns the current admin address.
     */
    function getAdmin() public view returns (address) {
        return _getAdmin();
    }
}