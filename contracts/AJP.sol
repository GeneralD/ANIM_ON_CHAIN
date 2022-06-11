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
import "@openzeppelin/contracts-upgradeable/utils/cryptography/MerkleProofUpgradeable.sol";

contract AJP is ERC721AUpgradeable, ERC721ABurnableUpgradeable, ERC721AQueryableUpgradeable, OwnableUpgradeable {
    using MerkleProofUpgradeable for bytes32[];

    function initialize() public initializerERC721A initializer {
        __ERC721A_init("ANIM.JP", "AJP");
        __ERC721ABurnable_init();
        __ERC721AQueryable_init();
        __Ownable_init();

        baseURI = "https://anim.jp/nfts/";
        mintLimit = 9_999;
        paused = false;
    }

    function _startTokenId() internal pure virtual override returns (uint256) {
        return 1;
    }

    ///////////////////////////////////////////////////////////////////
    //// Base URI
    ///////////////////////////////////////////////////////////////////

    string public baseURI;

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    function setBaseURI(string memory baseURI_) external onlyOwner {
        baseURI = baseURI_;
    }

    ///////////////////////////////////////////////////////////////////
    //// Minting Tokens
    ///////////////////////////////////////////////////////////////////

    function whitelistMint(
        uint256 quantity,
        bool claimBonus,
        bytes32[] calldata merkleProof
    )
        external
        payable
        whenNotPaused
        checkMintLimit(quantity)
        checkWhitelist(merkleProof)
        checkWhitelistMintLimit(quantity)
        checkPay(WHITELIST_PRICE, quantity)
    {
        _safeMint(msg.sender, claimBonus ? bonusQuantity(quantity) : quantity);
    }

    function publicMint(uint256 quantity)
        external
        payable
        whenNotPaused
        checkMintLimit(quantity)
        checkPay(PUBLIC_PRICE, quantity)
    {
        _safeMint(msg.sender, quantity);
    }

    function adminMint(uint256 quantity) external payable onlyOwner checkMintLimit(quantity) {
        _mint(msg.sender, quantity);
    }

    function adminMintTo(address to, uint256 quantity) external payable onlyOwner checkMintLimit(quantity) {
        _mint(to, quantity);
    }

    ///////////////////////////////////////////////////////////////////
    //// Minting Limit
    ///////////////////////////////////////////////////////////////////

    uint256 public mintLimit;

    function setMintLimit(uint256 _mintLimit) external onlyOwner {
        mintLimit = _mintLimit;
    }

    modifier checkMintLimit(uint256 quantity) {
        require(_totalMinted() + quantity <= mintLimit, "minting exceeds the limit");
        _;
    }

    ///////////////////////////////////////////////////////////////////
    //// Pricing
    ///////////////////////////////////////////////////////////////////

    uint256 public constant WHITELIST_PRICE = .06 ether;
    uint256 public constant PUBLIC_PRICE = .08 ether;

    modifier checkPay(uint256 price, uint256 quantity) {
        require(msg.value >= price * quantity, "not enough eth");
        _;
    }

    ///////////////////////////////////////////////////////////////////
    //// Whitelist
    ///////////////////////////////////////////////////////////////////

    uint256 public constant WHITELISTED_OWNER_MINT_LIMIT = 100;

    bytes32 private _merkleRoot;

    function setWhitelist(bytes32 merkleRoot) external onlyOwner {
        _merkleRoot = merkleRoot;
    }

    function isWhitelisted(bytes32[] calldata merkleProof) public view returns (bool) {
        return merkleProof.verify(_merkleRoot, keccak256(abi.encodePacked(msg.sender)));
    }

    modifier checkWhitelist(bytes32[] calldata merkleProof) {
        require(isWhitelisted(merkleProof), "invalid merkle proof");
        _;
    }

    modifier checkWhitelistMintLimit(uint256 quantity) {
        require(_numberMinted(msg.sender) + quantity <= WHITELISTED_OWNER_MINT_LIMIT, "WL minting exceeds the limit");
        _;
    }

    ///////////////////////////////////////////////////////////////////
    //// Whitelist Bonus
    ///////////////////////////////////////////////////////////////////

    uint256 public constant WHITELIST_BONUS_PER = 10;

    /**
     * @dev returns baseQuantity + bonus.
     */
    function bonusQuantity(uint256 baseQuantity) public view returns (uint256) {
        uint256 totalMinted = _totalMinted();
        require(totalMinted + baseQuantity <= mintLimit, "minting exceeds the limit");
        uint256 bonus = baseQuantity / WHITELIST_BONUS_PER;
        uint256 bonusAdded = baseQuantity + bonus;
        // unfortunately if there are not enough stocks, you can't earn full bonus!
        return totalMinted + bonusAdded > mintLimit ? mintLimit - totalMinted : bonusAdded;
    }

    ///////////////////////////////////////////////////////////////////
    //// Pausing
    ///////////////////////////////////////////////////////////////////

    event Paused(address account);
    event Unpaused(address account);

    bool public paused;

    function pause() external onlyOwner whenNotPaused {
        paused = true;
        emit Paused(_msgSender());
    }

    function unpause() external onlyOwner whenPaused {
        paused = false;
        emit Unpaused(_msgSender());
    }

    modifier whenNotPaused() {
        require(!paused, "Pausable: paused");
        _;
    }

    modifier whenPaused() {
        require(paused, "Pausable: not paused");
        _;
    }

    ///////////////////////////////////////////////////////////////////
    //// Withdraw
    ///////////////////////////////////////////////////////////////////

    // TODO: divide money peacefully
    function withdraw() external onlyOwner {
        uint256 amount = address(this).balance;
        payable(msg.sender).transfer(amount);
    }
}
