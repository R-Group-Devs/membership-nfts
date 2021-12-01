//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import {ERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {Counters} from "@openzeppelin/contracts/utils/Counters.sol";
import {NFTDescriptor} from "./NFTDescriptor.sol";

/**
 *
 * MEMBERSHIPS
 *
 * written with <3 by Ezra Weller and R Group, working with Rarible DAO
 *
 */

contract Memberships is Initializable, ERC721Upgradeable, OwnableUpgradeable {
    using Counters for Counters.Counter;

    //===== State =====//

    string internal _organization;
    bool internal _transferable;
    mapping(uint256 => string) internal _nickNames;
    mapping(uint256 => address) internal _mintedTo;
    Counters.Counter internal _counter;

    //===== Interfaces =====//

    struct TokenData {
        uint256 id;
        address owner;
        address mintedTo;
        string nickName;
        string organization;
        string tokenName;
    }

    //===== Events =====//

    event ToggleTransferable(bool transferable);

    //===== External Functions =====//

    function batchMint(
        address[] calldata toAddresses,
        string[] calldata nickNames
    ) external onlyOwner {
        require(
            toAddresses.length == nickNames.length,
            "Memberships: Array length mismatch"
        );
        for (uint256 i = 0; i < toAddresses.length; i++) {
            _mint(toAddresses[i], nickNames[i]);
        }
    }

    function burn(uint256 tokenId) external onlyOwner {
        require(_exists(tokenId), "Memberships: Non-existent token");
        _burn(tokenId);
    }

    function batchBurn(uint256[] calldata tokenIds) external onlyOwner {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            require(_exists(tokenIds[i]), "Memberships: Non-existent token");
            _burn(tokenIds[i]);
        }
    }

    function toggleTransferable() external onlyOwner returns (bool) {
        if (_transferable) {
            _transferable = false;
        } else {
            _transferable = true;
        }
        emit ToggleTransferable(_transferable);
        return _transferable;
    }

    //===== Public Functions =====//

    function initialize(
        string memory name_,
        string memory symbol_,
        string memory organization_,
        bool transferable_,
        address owner
    ) public initializer {
        __ERC721_init(name_, symbol_);
        __Ownable_init();
        _organization = organization_;
        _transferable = transferable_;
        transferOwnership(owner);
    }

    function mint(address to, string calldata nickName) public onlyOwner {
        _mint(to, nickName);
    }

    function organization() public view returns (string memory) {
        return _organization;
    }

    function transferable() public view returns (bool) {
        return _transferable;
    }

    function mintedTo(uint256 tokenId) public view returns (address) {
        return _mintedTo[tokenId];
    }

    function nickNameOf(uint256 tokenId) public view returns (string memory) {
        return _nickNames[tokenId];
    }

    function nextId() public view returns (uint256) {
        return _counter.current();
    }

    function tokenDataOf(uint256 tokenId)
        public
        view
        returns (TokenData memory)
    {
        TokenData memory tokenData = TokenData(
            tokenId,
            ownerOf(tokenId),
            mintedTo(tokenId),
            nickNameOf(tokenId),
            organization(),
            name()
        );
        return tokenData;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        require(_exists(tokenId), "Memberships: non-existent token");
        NFTDescriptor.TokenURIParams memory params = NFTDescriptor
            .TokenURIParams(
                tokenId,
                mintedTo(tokenId),
                nickNameOf(tokenId),
                organization(),
                name()
            );
        return NFTDescriptor.constructTokenURI(params);
    }

    // Added isTransferable only
    function approve(address to, uint256 tokenId)
        public
        override
        isTransferable
    {
        address owner = ERC721Upgradeable.ownerOf(tokenId);
        require(to != owner, "ERC721: approval to current owner");

        require(
            _msgSender() == owner || isApprovedForAll(owner, _msgSender()),
            "ERC721: approve caller is not owner nor approved for all"
        );

        _approve(to, tokenId);
    }

    // Added isTransferable only
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override isTransferable {
        //solhint-disable-next-line max-line-length
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "ERC721: transfer caller is not owner nor approved"
        );

        _transfer(from, to, tokenId);
    }

    // Added isTransferable only
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) public override isTransferable {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "ERC721: transfer caller is not owner nor approved"
        );
        _safeTransfer(from, to, tokenId, _data);
    }

    //===== Internal Functions =====//

    function _mint(address to, string calldata nickName) internal {
        uint256 tokenId = _counter.current();
        _nickNames[tokenId] = nickName;
        _mintedTo[tokenId] = to;
        _safeMint(to, tokenId);
        _counter.increment();
    }

    //===== Modifiers =====//

    modifier isTransferable() {
        require(transferable() == true, "Memberships: not transferable");
        _;
    }
}
