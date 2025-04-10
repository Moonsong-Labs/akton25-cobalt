// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import { Ownable } from "@openzeppelin-contracts/access/Ownable.sol";
import { Tavern } from "./Tavern.sol";
import { EnumerableSet } from "@openzeppelin-contracts/utils/structs/EnumerableSet.sol";

contract Quest is Ownable {
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

    struct QuestDetails {
        string metadataUrl;
        QuestStatus status;
        EnumerableSet.UintSet heroes;
    }

    /*//////////////////////////////////////////////////////////////////////////
                                     Events
    //////////////////////////////////////////////////////////////////////////*/

    event QuestStatusUpdated(uint256 indexed questId, QuestStatus status);

    event HeroEnrolled(uint256 indexed questId, uint256 indexed heroId);

    event TaskPerformed(uint256 indexed questId, uint256 indexed heroId, Task task);

    event TaskResolved(uint256 indexed questId, uint256 indexed heroId, Task task, Outcome outcome);

    /*//////////////////////////////////////////////////////////////////////////
                                     STORAGE
    //////////////////////////////////////////////////////////////////////////*/

    Tavern private _tavern;
    uint256 private _nextQuestId;
    mapping(uint256 questId => QuestDetails) private _quests;

    /*//////////////////////////////////////////////////////////////////////////
                                PUBLIC FUNCTIONS
    //////////////////////////////////////////////////////////////////////////*/

    modifier when(uint256 questId, QuestStatus status) {
        require(_quests[questId].status == status, "Quest not in correct state");
        _;
    }

    modifier onlyHeroMaster(uint256 heroId) {
        require(_tavern.ownerOf(heroId) == msg.sender, "Not your hero!");
        _;
    }

    constructor(Tavern tavern, address initialOwner) Ownable(initialOwner) {
        _tavern = tavern;
    }

    function createNewQuest(string calldata metadataUrl) external onlyOwner returns (uint256) {
        uint256 questId = _nextQuestId++;

        _quests[questId].metadataUrl = metadataUrl;
        _quests[questId].status = QuestStatus.OPEN;

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
        require(_quests[questId].heroes.add(heroId), "Hero already in quest");

        emit HeroEnrolled(questId, heroId);
    }

    function startQuest(uint256 questId) external onlyOwner when(questId, QuestStatus.OPEN) {
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
        when(questId, QuestStatus.IN_PROGRESS)
    {
        require(_quests[questId].heroes.contains(heroId), "Hero not in quest");

        emit TaskPerformed(questId, heroId, task);
    }

    function resolveTask(
        uint256 questId,
        Outcome taskOutcome
    )
        external
        onlyOwner
        when(questId, QuestStatus.IN_PROGRESS)
    {
        // todo: implement
    }

    function finishQuest(uint256 questId) external onlyOwner when(questId, QuestStatus.IN_PROGRESS) {
        QuestDetails storage quest = _quests[questId];
        quest.status = QuestStatus.FINISHED;

        for (uint256 i = 0; i < quest.heroes.length(); i++) {
            uint256 heroId = quest.heroes.at(i);
            _tavern.levelUp(heroId);
            // Logic to finish the quest for each hero
        }

        emit QuestStatusUpdated(questId, QuestStatus.FINISHED);
    }

    function questHeroes(uint256 questId) external view returns (uint256[] memory) {
        return _quests[questId].heroes.values();
    }

    function url(uint256 questId) external view returns (string memory) {
        return _quests[questId].metadataUrl;
    }

    /*//////////////////////////////////////////////////////////////////////////
                               INTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////////////////*/
}
