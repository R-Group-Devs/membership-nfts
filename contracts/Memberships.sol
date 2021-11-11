//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Memberships is ERC721, Ownable {
    using Counters for Counters.Counter;

    struct TokenData {
        uint256 id;
        address owner;
        string nickName;
        string organization;
        string tokenName;
    }

    // Organization name
    string private _organization;

    // Nicknames
    mapping(uint256 => string) private _nickNames;

    // Token counter
    Counters.Counter private _counter;

    // TODO make these simple, cool SVGs that integrate that organzation, token name, and owner nick name
    // URIs
    mapping(uint256 => string) private _uris;

    constructor(string memory name_, string memory symbol_, string memory organization_) ERC721(name_, symbol_) {
        _organization = organization_;
    }

    function _mint(address to, string calldata nickName) internal {
        uint256 tokenId = _counter.current();
        _nickNames[tokenId] = nickName;
        _uris[tokenId] = "placeholder";
        _safeMint(to, tokenId);
        _counter.increment();
    }

    function mint(address to, string calldata nickName) public onlyOwner {
        require(to != address(0), "Tried to mint to 0 address");
        _mint(to, nickName);
    }

    function batchMint(address[] calldata toAddresses, string[] calldata nickNames) external onlyOwner {
        require(toAddresses.length == nickNames.length, "Array length mismatch");
        for(uint256 i = 0; i < toAddresses.length; i++) {
            _mint(toAddresses[i], nickNames[i]);
        }
    }

    function burn(uint256 tokenId) external onlyOwner {
        require(_exists(tokenId), "Nonexistent token");
        _burn(tokenId);
    }

    function batchBurn(uint256[] calldata tokenIds) external onlyOwner {
        for(uint256 i = 0; i < tokenIds.length; i++) {
            _burn(tokenIds[i]);
        }
    }

    function organization() public view returns (string memory) {
        return _organization;
    }

    function nickNameOf(uint256 tokenId) public view returns (string memory) {
        return _nickNames[tokenId];
    }

    function lastId() public view returns (uint256) {
        return _counter.current() - 1;
    }

    function tokenDataOf(uint256 tokenId) public view returns (TokenData memory) {
        TokenData memory tokenData = TokenData(
            tokenId,
            ownerOf(tokenId),
            nickNameOf(tokenId),
            organization(),
            name()
        );
        return tokenData;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Nonexistent token");
        return _uris[tokenId];
    }

    // All transfers DISABLED (contract will still emit standard transfer event on mint)
    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal pure override {
        require(false == true, "Memberships cannot be transferred");
    }
}