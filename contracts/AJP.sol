/*

   ▒██▒    ███   ██   ██████   ███  ███               █████  ██████▒  
   ▓██▓    ███   ██   ██████   ███  ███               █████  ███████▒ 
   ████    ███▒  ██     ██     ███▒▒███                  ██  ██   ▒██ 
   ████    ████  ██     ██     ███▓▓███                  ██  ██    ██ 
  ▒█▓▓█▒   ██▒█▒ ██     ██     ██▓██▓██                  ██  ██   ▒██ 
  ▓█▒▒█▓   ██ ██ ██     ██     ██▒██▒██                  ██  ███████▒ 
  ██  ██   ██ ██ ██     ██     ██░██░██                  ██  ██████▒  
  ██████   ██ ▒█▒██     ██     ██ ██ ██                  ██  ██       
 ░██████░  ██  ████     ██     ██    ██                  ██  ██       
 ▒██  ██▒  ██  ▒███     ██     ██    ██     ██     █▒   ▒██  ██       
 ███  ███  ██   ███   ██████   ██    ██     ██     ███████▓  ██       
 ██▒  ▒██  ██   ███   ██████   ██    ██     ██     ░█████▒   ██       

         --- ANIMATED NEW WORLDS IN THE METAVERSE. ANIM.JP ---
*/

// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

// @author Yumenosuke Kokata from ANIM.JP (CTO)
// @title ANIM.JP NFT

import "erc721a-upgradeable/contracts/ERC721AUpgradeable.sol";
import "erc721a-upgradeable/contracts/extensions/ERC721ABurnableUpgradeable.sol";
import "erc721a-upgradeable/contracts/extensions/ERC721AQueryableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/MerkleProofUpgradeable.sol";

contract AJP is ERC721AUpgradeable, ERC721ABurnableUpgradeable, ERC721AQueryableUpgradeable, OwnableUpgradeable {
    using MerkleProofUpgradeable for bytes32[];

    uint256 private constant WHITELISTED_OWNER_MINT_LIMIT = 20;
    uint256 private constant WHITELIST_PRICE = .06 ether;
    uint256 private constant PUBLIC_PRICE = .08 ether;

    ///////////////////////////////////////////////////////////////////
    //// Override to Configure
    ///////////////////////////////////////////////////////////////////

    function initialize() public initializerERC721A initializer {
        __ERC721A_init("ANIM.JP", "AJP");
        __Ownable_init();
    }

    function _baseURI() internal pure virtual override returns (string memory) {
        return "https://anim.jp/nfts/";
    }

    function _startTokenId() internal pure virtual override returns (uint256) {
        return 1;
    }

    ///////////////////////////////////////////////////////////////////
    //// Minting Tokens
    ///////////////////////////////////////////////////////////////////

    function whitelistMint(uint256 quantity, bytes32[] calldata merkleProof)
        external
        payable
        whenNotPaused
        checkWhitelist(merkleProof)
        checkWhitelistMintLimit(quantity)
    {
        _safeMint(msg.sender, quantity);
    }

    function adminMint(uint256 quantity) external payable onlyOwner {
        _mint(msg.sender, quantity);
    }

    function adminMint(address to, uint256 quantity) external payable onlyOwner {
        _mint(to, quantity);
    }

    ///////////////////////////////////////////////////////////////////
    //// Whitelist
    ///////////////////////////////////////////////////////////////////

    bytes32 private _merkleRoot;

    function setWhitelist(bytes32 merkleRoot) external onlyOwner {
        _merkleRoot = merkleRoot;
    }

    modifier checkWhitelist(bytes32[] calldata merkleProof) {
        require(merkleProof.verify(_merkleRoot, keccak256(abi.encodePacked(msg.sender))), "invalid merkle proof");
        _;
    }

    modifier checkWhitelistMintLimit(uint256 quantity) {
        require(_numberMinted(msg.sender) + quantity <= WHITELISTED_OWNER_MINT_LIMIT, "WL minting exceeds the limit");
        _;
    }

    ///////////////////////////////////////////////////////////////////
    //// Pausing
    ///////////////////////////////////////////////////////////////////

    event Paused(address account);
    event Unpaused(address account);

    bool private _paused = false;

    function paused() external view returns (bool) {
        return _paused;
    }

    function pause() external onlyOwner whenNotPaused {
        _paused = true;
        emit Paused(_msgSender());
    }

    function unpause() external onlyOwner whenPaused {
        _paused = false;
        emit Unpaused(_msgSender());
    }

    modifier whenNotPaused() {
        require(!_paused, "Pausable: paused");
        _;
    }

    modifier whenPaused() {
        require(_paused, "Pausable: not paused");
        _;
    }
}
