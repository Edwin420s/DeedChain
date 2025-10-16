// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title DeedNFT
 * @dev ERC721 token representing land/property ownership deeds
 * Each token represents a verified property with metadata stored on IPFS
 */
contract DeedNFT is ERC721, ERC721URIStorage, AccessControl {
    using Counters for Counters.Counter;
    
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");
    bytes32 public constant TOKENIZER_ROLE = keccak256("TOKENIZER_ROLE");
    
    Counters.Counter private _tokenIdCounter;
    
    struct PropertyInfo {
        string geoCoordinates;
        uint256 areaSize;
        string surveyNumber;
        address verifiedBy;
        uint256 verificationTimestamp;
        bool isVerified;
        bool isTokenized;
    }
    
    mapping(uint256 => PropertyInfo) public propertyInfo;
    
    event PropertyRegistered(
        uint256 indexed tokenId,
        address indexed owner,
        string ipfsHash,
        string geoCoordinates,
        uint256 areaSize
    );
    
    event PropertyVerified(
        uint256 indexed tokenId,
        address indexed verifier,
        uint256 timestamp
    );

    constructor() ERC721("DeedChain Property", "DEED") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(REGISTRAR_ROLE, msg.sender);
        _grantRole(TOKENIZER_ROLE, msg.sender);
    }

    function registerProperty(
        address to,
        string memory ipfsHash,
        string memory geoCoordinates,
        uint256 areaSize,
        string memory surveyNumber
    ) public onlyRole(REGISTRAR_ROLE) returns (uint256) {
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        
        _mint(to, tokenId);
        _setTokenURI(tokenId, ipfsHash);
        
        propertyInfo[tokenId] = PropertyInfo({
            geoCoordinates: geoCoordinates,
            areaSize: areaSize,
            surveyNumber: surveyNumber,
            verifiedBy: address(0),
            verificationTimestamp: 0,
            isVerified: false,
            isTokenized: false
        });

        emit PropertyRegistered(tokenId, to, ipfsHash, geoCoordinates, areaSize);
        return tokenId;
    }

    function verifyProperty(uint256 tokenId) public onlyRole(VERIFIER_ROLE) {
        require(_exists(tokenId), "Property does not exist");
        require(!propertyInfo[tokenId].isVerified, "Property already verified");
        
        propertyInfo[tokenId].isVerified = true;
        propertyInfo[tokenId].verifiedBy = msg.sender;
        propertyInfo[tokenId].verificationTimestamp = block.timestamp;
        
        emit PropertyVerified(tokenId, msg.sender, block.timestamp);
    }

    function getPropertyInfo(uint256 tokenId) public view returns (PropertyInfo memory) {
        require(_exists(tokenId), "Property does not exist");
        return propertyInfo[tokenId];
    }

    /**
     * @dev Public existence check wrapper for external contracts
     */
    function exists(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId);
    }

    /**
     * @dev Update tokenization status for a property. Restricted to TOKENIZER_ROLE.
     */
    function setTokenizedStatus(uint256 tokenId, bool status) public onlyRole(TOKENIZER_ROLE) {
        require(_exists(tokenId), "Property does not exist");
        propertyInfo[tokenId].isTokenized = status;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
}