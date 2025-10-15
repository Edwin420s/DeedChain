// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title DeedNFT
 * @dev ERC721 token representing land/property deeds with verification system
 */
contract DeedNFT is ERC721, ERC721URIStorage, AccessControl {
    using Counters for Counters.Counter;
    
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");
    
    Counters.Counter private _tokenIdCounter;
    
    // Land deed structure
    struct LandDeed {
        uint256 tokenId;
        address owner;
        string ipfsHash;
        string location;
        uint256 areaSize;
        bool verified;
        uint256 verifiedAt;
        address verifiedBy;
    }
    
    // Mapping from token ID to land deed details
    mapping(uint256 => LandDeed) public landDeeds;
    
    // Mapping from IPFS hash to token ID to prevent duplicates
    mapping(string => uint256) public ipfsToTokenId;
    
    // Events
    event DeedMinted(
        uint256 indexed tokenId,
        address indexed owner,
        string ipfsHash,
        string location,
        uint256 areaSize
    );
    
    event DeedVerified(
        uint256 indexed tokenId,
        address indexed verifier,
        uint256 verifiedAt
    );
    
    event DeedTransferred(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        uint256 transferredAt
    );

    constructor() ERC721("DeedChain Land Deed", "DEED") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(REGISTRAR_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }

    /**
     * @dev Mint a new land deed NFT
     * @param to The address that will own the deed
     * @param ipfsHash IPFS hash containing property metadata
     * @param location Physical location description
     * @param areaSize Size of the land in square meters
     */
    function mintDeed(
        address to,
        string memory ipfsHash,
        string memory location,
        uint256 areaSize
    ) external onlyRole(REGISTRAR_ROLE) returns (uint256) {
        require(bytes(ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(ipfsToTokenId[ipfsHash] == 0, "Deed already exists with this IPFS hash");
        
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, ipfsHash);
        
        landDeeds[tokenId] = LandDeed({
            tokenId: tokenId,
            owner: to,
            ipfsHash: ipfsHash,
            location: location,
            areaSize: areaSize,
            verified: false,
            verifiedAt: 0,
            verifiedBy: address(0)
        });
        
        ipfsToTokenId[ipfsHash] = tokenId;
        
        emit DeedMinted(tokenId, to, ipfsHash, location, areaSize);
        
        return tokenId;
    }

    /**
     * @dev Verify a land deed (only verifiers can call this)
     * @param tokenId The token ID to verify
     */
    function verifyDeed(uint256 tokenId) external onlyRole(VERIFIER_ROLE) {
        require(_exists(tokenId), "Deed does not exist");
        require(!landDeeds[tokenId].verified, "Deed already verified");
        
        landDeeds[tokenId].verified = true;
        landDeeds[tokenId].verifiedAt = block.timestamp;
        landDeeds[tokenId].verifiedBy = msg.sender;
        
        emit DeedVerified(tokenId, msg.sender, block.timestamp);
    }

    /**
     * @dev Get land deed details
     * @param tokenId The token ID to query
     */
    function getDeed(uint256 tokenId) external view returns (LandDeed memory) {
        require(_exists(tokenId), "Deed does not exist");
        return landDeeds[tokenId];
    }

    /**
     * @dev Check if deed is verified
     * @param tokenId The token ID to check
     */
    function isDeedVerified(uint256 tokenId) external view returns (bool) {
        require(_exists(tokenId), "Deed does not exist");
        return landDeeds[tokenId].verified;
    }

    /**
     * @dev Get total number of minted deeds
     */
    function totalDeeds() external view returns (uint256) {
        return _tokenIdCounter.current();
    }

    /**
     * @dev Override transfer to include custom logic
     */
    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override {
        require(landDeeds[tokenId].verified, "Cannot transfer unverified deed");
        
        super._transfer(from, to, tokenId);
        
        // Update owner in landDeeds mapping
        landDeeds[tokenId].owner = to;
        
        emit DeedTransferred(tokenId, from, to, block.timestamp);
    }

    /**
     * @dev Check if token exists
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    // The following functions are overrides required by Solidity.
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}