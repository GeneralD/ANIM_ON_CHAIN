// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "erc721a-upgradeable/contracts/ERC721AUpgradeable.sol";
import "erc721a-upgradeable/contracts/extensions/ERC721ABurnableUpgradeable.sol";
import "erc721a-upgradeable/contracts/extensions/ERC721AQueryableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/MerkleProofUpgradeable.sol";

contract AJPTest2 is ERC721AUpgradeable, ERC721ABurnableUpgradeable, ERC721AQueryableUpgradeable, OwnableUpgradeable {
    using MerkleProofUpgradeable for bytes32[];

    function initialize() public initializerERC721A initializer {
        __ERC721A_init("ANIM.JP", "AJP");
        __ERC721ABurnable_init();
        __ERC721AQueryable_init();
        __Ownable_init();

        baseURI = "https://anim.jp/nfts/";
        mintLimit = 9_999;
        isChiefMintPaused = false;
        isPublicMintPaused = true;
        isWhitelistMintPaused = true;
        newField = 555;
    }

    function _startTokenId() internal pure virtual override returns (uint256) {
        return 1;
    }

    function migrate(uint256 _newField) public reinitializer(2) {
        newField = _newField;
    }

    uint96 private _royaltyFraction;
    string public baseURI;
    uint256 public mintLimit;
    bytes32 private _chiefsMerkleRoot;
    bytes32 private _merkleRoot;
    bool public isChiefMintPaused;
    bool public isPublicMintPaused;
    bool public isWhitelistMintPaused;

    uint256 public newField;
}
