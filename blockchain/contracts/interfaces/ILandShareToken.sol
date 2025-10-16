// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface ILandShareToken {
    function mint(address to, uint256 amount) external;
    function burn(address from, uint256 amount) external;
    function propertyId() external view returns (uint256);
    function tokenizationManager() external view returns (address);
}