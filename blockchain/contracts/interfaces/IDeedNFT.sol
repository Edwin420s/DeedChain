// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IDeedNFT {
    struct PropertyInfo {
        string geoCoordinates;
        uint256 areaSize;
        string surveyNumber;
        address verifiedBy;
        uint256 verificationTimestamp;
        bool isVerified;
        bool isTokenized;
    }

    function registerProperty(
        address to,
        string memory ipfsHash,
        string memory geoCoordinates,
        uint256 areaSize,
        string memory surveyNumber
    ) external returns (uint256);

    function verifyProperty(uint256 tokenId) external;
    function getPropertyInfo(uint256 tokenId) external view returns (PropertyInfo memory);
    function ownerOf(uint256 tokenId) external view returns (address);
}