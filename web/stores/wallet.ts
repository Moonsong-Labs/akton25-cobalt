import { writable } from "svelte/store";
import type { Writable } from "svelte/store";
import { ethers, BrowserProvider, Contract } from "ethers";

interface Hero {
  id: number;
  name: string;
  level: number;
}

interface WalletState {
  isConnected: boolean;
  account: string;
  provider: BrowserProvider | null;
  questContract: Contract | null;
  tavernContract: Contract | null;
  userHeroes: Hero[];
}

// Contract ABIs
export const QUEST_ABI = [
  "event QuestStatusUpdated(uint256 indexed questId, uint8 status)",
  "event HeroEnrolled(uint256 indexed questId, uint256 indexed heroId)",
  "event TaskPerformed(uint256 indexed questId, uint256 indexed heroId, uint8 task)",
  "function joinQuest(uint256 questId, uint256 heroId)",
  "function performTask(uint256 questId, uint256 heroId, uint8 task)",
  "function questHeroes(uint256 questId) view returns (uint256[])",
  "function url(uint256 questId) view returns (string)",
];

export const TAVERN_ABI = [
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function heroInfo(uint256 id) view returns ((string,uint256,string,uint256,(uint256,uint256,uint256,uint256,uint256,uint256)))",
];

// Contract addresses (to be replaced with actual addresses)
export const QUEST_ADDRESS = "0x...";
export const TAVERN_ADDRESS = "0x...";

function createWalletStore() {
  const { subscribe, set, update } = writable<WalletState>({
    isConnected: false,
    account: "",
    provider: null,
    questContract: null,
    tavernContract: null,
    userHeroes: [],
  });

  return {
    subscribe,
    connect: async (): Promise<boolean> => {
      try {
        if (window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await provider.send("eth_requestAccounts", []);
          const account = accounts[0];

          // Initialize contracts
          const questContract = new ethers.Contract(
            QUEST_ADDRESS,
            QUEST_ABI,
            provider
          );
          const tavernContract = new ethers.Contract(
            TAVERN_ADDRESS,
            TAVERN_ABI,
            provider
          );

          // Load user's heroes
          const userHeroes = await loadUserHeroes(tavernContract);

          set({
            isConnected: true,
            account,
            provider,
            questContract,
            tavernContract,
            userHeroes,
          });

          return true;
        } else {
          alert("Please install MetaMask to use this application!");
          return false;
        }
      } catch (error) {
        console.error("Error connecting wallet:", error);
        return false;
      }
    },
    disconnect: (): void => {
      set({
        isConnected: false,
        account: "",
        provider: null,
        questContract: null,
        tavernContract: null,
        userHeroes: [],
      });
    },
  };
}

async function loadUserHeroes(tavernContract: Contract): Promise<Hero[]> {
  try {
    // This would need to be implemented based on your contract's token enumeration
    // For now, we'll simulate it
    return [
      { id: 1, name: "Sir Lancelot", level: 5 },
      { id: 2, name: "Lady Morgana", level: 3 },
    ];
  } catch (error) {
    console.error("Error loading heroes:", error);
    return [];
  }
}

export const wallet = createWalletStore();
