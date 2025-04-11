import { BaseContract } from "ethers";

export interface QuestContract extends BaseContract {
  joinQuest(
    questId: number,
    heroId: number
  ): Promise<ethers.ContractTransactionResponse>;
  // Events
  HeroEnrolled: ethers.EventFragment;
  QuestStatusUpdated: ethers.EventFragment;
  TaskPerformed: ethers.EventFragment;
  // Add other contract methods as needed
}

export interface TavernContract extends BaseContract {
  // Events
  Transfer: ethers.EventFragment;
}
