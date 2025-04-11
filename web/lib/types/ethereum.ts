import { BaseContract } from "ethers";

export interface QuestContract extends BaseContract {
  joinQuest(
    questId: number,
    heroId: number
  ): Promise<ethers.ContractTransactionResponse>;
  // Add other contract methods as needed
}
