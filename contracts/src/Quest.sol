// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import { Ownable } from "@openzeppelin-contracts/access/Ownable.sol";
import { Tavern } from "./Tavern.sol";
import { EnumerableSet } from "@openzeppelin-contracts/utils/structs/EnumerableSet.sol";

contract Quest is Ownable {
    uint8 public constant MAX_HEROES = 1;
    uint8 public constant MAX_TASKS = 3;

    using EnumerableSet for EnumerableSet.UintSet;

    enum QuestStatus {
        OPEN,
        IN_PROGRESS,
        FINISHED
    }

    enum Outcome {
        PASS,
        FAIL
    }

    enum Task {
        ROMANCE,
        FIGHT,
        BRIBE,
        PERSUADE,
        SNEAK
    }

    struct Round {
        uint256 heroId;
        Outcome outcome;
    }

    struct QuestDetails {
        string metadataUrl;
        QuestStatus status;
        EnumerableSet.UintSet heroes;
        Round[] progress;
    }

    /*//////////////////////////////////////////////////////////////////////////
                                     Events
    //////////////////////////////////////////////////////////////////////////*/

    event QuestStatusUpdated(uint256 indexed questId, QuestStatus status);

    event HeroEnrolled(uint256 indexed questId, uint256 indexed heroId);

    event TaskPerformed(uint256 indexed questId, uint256 indexed heroId, Task task);

    /*//////////////////////////////////////////////////////////////////////////
                                     STORAGE
    //////////////////////////////////////////////////////////////////////////*/

    Tavern private _tavern;
    uint256 private _nextQuestId;
    mapping(uint256 questId => QuestDetails) private _quests;

    /*//////////////////////////////////////////////////////////////////////////
                                PUBLIC FUNCTIONS
    //////////////////////////////////////////////////////////////////////////*/

    modifier when(uint256 questId, QuestStatus requiredStatus) {
        require(_quests[questId].status == requiredStatus, "Quest not in correct state");
        _;
    }

    modifier onlyHeroMaster(uint256 heroId) {
        require(_tavern.ownerOf(heroId) == msg.sender, "Not your hero!");
        _;
    }

    modifier onlyEnrolledHero(uint256 questId, uint256 heroId) {
        require(_quests[questId].heroes.contains(heroId), "Hero not in quest");
        _;
    }

    constructor(Tavern tavern, address initialOwner) Ownable(initialOwner) {
        _tavern = tavern;
    }

    function createNewQuest(string calldata metadataUrl) external onlyOwner returns (uint256) {
        uint256 questId = _nextQuestId++;

        QuestDetails storage quest = _quests[questId];
        quest.metadataUrl = metadataUrl;
        quest.status = QuestStatus.OPEN;

        emit QuestStatusUpdated(questId, QuestStatus.OPEN);

        return questId;
    }

    function joinQuest(
        uint256 questId,
        uint256 heroId
    )
        external
        onlyHeroMaster(heroId)
        when(questId, QuestStatus.OPEN)
    {
        require(!isFull(questId), "Quest full");
        require(_quests[questId].heroes.add(heroId), "Hero already in quest");

        emit HeroEnrolled(questId, heroId);
    }

    function startQuest(uint256 questId) external when(questId, QuestStatus.OPEN) {
        require(isFull(questId), "Quest not full");
        _quests[questId].status = QuestStatus.IN_PROGRESS;
        emit QuestStatusUpdated(questId, QuestStatus.IN_PROGRESS);
    }

    function performTask(
        uint256 questId,
        uint256 heroId,
        Task task
    )
        external
        onlyHeroMaster(heroId)
        onlyEnrolledHero(questId, heroId)
        when(questId, QuestStatus.IN_PROGRESS)
    {
        emit TaskPerformed(questId, heroId, task);
    }

    function resolveTask(
        uint256 questId,
        uint256 heroId,
        Outcome taskOutcome,
        string calldata metadataUrl
    )
        external
        onlyOwner
        onlyEnrolledHero(questId, heroId)
        when(questId, QuestStatus.IN_PROGRESS)
    {
        QuestDetails storage quest = _quests[questId];
        quest.progress.push(Round({ heroId: heroId, outcome: taskOutcome }));
        quest.metadataUrl = metadataUrl;

        if (_quests[questId].progress.length == MAX_TASKS) {
            _finishQuest(questId);
        }
    }

    function questHeroes(uint256 questId) external view returns (uint256[] memory) {
        return _quests[questId].heroes.values();
    }

    function url(uint256 questId) external view returns (string memory) {
        return _quests[questId].metadataUrl;
    }

    function status(uint256 questId) external view returns (QuestStatus) {
        return _quests[questId].status;
    }

    function progress(uint256 questId) external view returns (Round[] memory) {
        return _quests[questId].progress;
    }

    function isFull(uint256 questId) public view returns (bool) {
        return _quests[questId].heroes.length() == MAX_HEROES;
    }

    /*//////////////////////////////////////////////////////////////////////////
                               INTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////////////////*/

    function _finishQuest(uint256 questId) private {
        QuestDetails storage quest = _quests[questId];
        require(quest.progress.length == MAX_TASKS, "Not all tasks resolved");

        quest.status = QuestStatus.FINISHED;

        for (uint256 i = 0; i < quest.heroes.length(); i++) {
            uint256 heroId = quest.heroes.at(i);
            _tavern.levelUp(heroId);
        }

        emit QuestStatusUpdated(questId, QuestStatus.FINISHED);
    }
}
