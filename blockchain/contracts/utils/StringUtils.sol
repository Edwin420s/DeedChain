// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

library StringUtils {
    function compare(string memory a, string memory b) internal pure returns (bool) {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }

    function concatenate(string memory a, string memory b) internal pure returns (string memory) {
        return string(abi.encodePacked(a, b));
    }

    function isEmpty(string memory a) internal pure returns (bool) {
        return bytes(a).length == 0;
    }
}