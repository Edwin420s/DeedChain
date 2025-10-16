// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockStableToken
 * @dev Mock stablecoin for testing purposes
 */
contract MockStableToken is ERC20 {
    uint8 private _decimals;
    
    constructor() ERC20("Mock USD Coin", "mUSDC") {
        _decimals = 6;
        _mint(msg.sender, 1000000 * 10**decimals());
    }
    
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
    
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}