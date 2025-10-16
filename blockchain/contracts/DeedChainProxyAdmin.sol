// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";

/**
 * @title DeedChainProxyAdmin
 * @dev Proxy admin contract for managing DeedChain upgrades
 */
contract DeedChainProxyAdmin is ProxyAdmin {
    constructor() ProxyAdmin() {}
    
    /**
     * @dev Returns the implementation contract for a proxy.
     */
    function getProxyImplementation(ITransparentUpgradeableProxy proxy) public view returns (address) {
        return super.getProxyImplementation(proxy);
    }
    
    /**
     * @dev Returns the admin of a proxy.
     */
    function getProxyAdmin(ITransparentUpgradeableProxy proxy) public view returns (address) {
        return super.getProxyAdmin(proxy);
    }
}