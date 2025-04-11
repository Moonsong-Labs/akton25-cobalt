// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.27;

import { ERC721 } from "@openzeppelin-contracts/token/ERC721/ERC721.sol";
import { ERC721Enumerable } from "@openzeppelin-contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import { Ownable } from "@openzeppelin-contracts/access/Ownable.sol";

contract Tavern is ERC721, ERC721Enumerable, Ownable {
    // Hero stats:
    struct Stats {
        uint256 strength;
        uint256 dexterity;
        uint256 willPower;
        uint256 intelligence;
        uint256 charisma;
        uint256 constitution;
    }

    struct Hero {
        string name;
        uint256 level;
        string metadataUrl;
        uint256 cooldown;
        Stats stats;
    }

    /*//////////////////////////////////////////////////////////////////////////
                                     STORAGE
    //////////////////////////////////////////////////////////////////////////*/

    address _quest;
    uint256 private _nextHeroId;
    mapping(uint256 heroId => Hero) private _heroes;

    /*//////////////////////////////////////////////////////////////////////////
                                PUBLIC FUNCTIONS
    //////////////////////////////////////////////////////////////////////////*/

    constructor(address initialOwner) ERC721("Hero", "HERO") Ownable(initialOwner) { }

    // One time setter for the quest contract.
    function setQuest(address quest) external onlyOwner {
        require(_quest == address(0), "Quest already set");
        _quest = quest;
    }

    modifier onlyQuest() {
        require(msg.sender == _quest, "Not a quest contract");
        _;
    }

    function recruit(
        address master,
        string calldata name,
        string calldata uri,
        Stats calldata initialStats
    )
        external
        onlyOwner
        returns (uint256)
    {
        uint256 heroId = _nextHeroId++;
        _safeMint(master, heroId);

        _heroes[heroId] = Hero({ name: name, level: 1, metadataUrl: uri, cooldown: 0, stats: initialStats });

        return heroId;
    }

    function heroInfo(uint256 id) external view returns (Hero memory) {
        require(_heroes[id].level > 0, "Unknown hero");
        return _heroes[id];
    }

    function levelUp(uint256 heroId) external onlyQuest {
        Hero storage hero = _heroes[heroId];
        hero.level++;
    }

    function setCooldown(uint256 heroId, uint256 period) external onlyQuest {
        Hero storage hero = _heroes[heroId];
        hero.cooldown = block.timestamp + period;
    }

    function isActive(uint256 heroId) external view returns (bool) {
        Hero storage hero = _heroes[heroId];
        return block.timestamp >= hero.cooldown;
    }

    /*//////////////////////////////////////////////////////////////////////////
                               INTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////////////////*/

    function _update(
        address to,
        uint256 heroId,
        address auth
    )
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, heroId, auth);
    }

    function _increaseBalance(address account, uint128 value) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
