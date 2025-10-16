// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";

/**
 * @title DeedNFTUpgradeable
 * @dev Upgradeable version of DeedNFT using UUPS pattern
 */
contract DeedNFTUpgradeable is 
    Initializable,
    ERC721Upgradeable,
    ERC721URIStorageUpgradeable,
    AccessControlUpgradeable,
    UUPSUpgradeable
{
    using CountersUpgradeable for CountersUpgradeable.Counter;
    
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    
    CountersUpgradeable.Counter private _tokenIdCounter;
    
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

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __ERC721_init("DeedChain Property", "DEED");
        __ERC721URIStorage_init();
        __AccessControl_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(REGISTRAR_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);
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

    function exists(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId);
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyRole(UPGRADER_ROLE)
    {}

    // The following functions are overrides required by Solidity
    function _burn(uint256 tokenId)
        internal
        override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Upgradeable, ERC721URIStorageUpgradeable, AccessControlUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}