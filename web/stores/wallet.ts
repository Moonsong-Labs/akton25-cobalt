import { writable, get } from "svelte/store";
import type { Writable } from "svelte/store";
import { ethers, BrowserProvider, Contract } from "ethers";
import Quest from "../../contracts/out/Quest.sol/Quest.json";
import Tavern from "../../contracts/out/Tavern.sol/Tavern.json";

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
  heroCount: number;
}

// Contract addresses from environment variables
const QUEST_ADDRESS = import.meta.env["VITE_QUEST_ADDRESS"];
const TAVERN_ADDRESS = import.meta.env["VITE_TAVERN_ADDRESS"];

if (!QUEST_ADDRESS || !TAVERN_ADDRESS) {
  throw new Error("Missing required environment variables: VITE_QUEST_ADDRESS and/or VITE_TAVERN_ADDRESS");
}

function createWalletStore() {
  const { subscribe, set, update } = writable<WalletState>({
    isConnected: false,
    account: "",
    provider: null,
    questContract: null,
    tavernContract: null,
    userHeroes: [],
    heroCount: 0,
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
            Quest.abi,
            provider
          );
          const tavernContract = new ethers.Contract(
            TAVERN_ADDRESS,
            Tavern.abi,
            provider
          );

          console.log("tavernContract", tavernContract);
          console.log("account", account);

          // Check hero balance
          const heroCount = await tavernContract["balanceOf"](account);
          console.log("Hero count:", heroCount.toString());

          // Load user's heroes
          const userHeroes = await loadUserHeroes(tavernContract);

          set({
            isConnected: true,
            account,
            provider,
            questContract,
            tavernContract,
            userHeroes,
            heroCount: Number(heroCount),
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
        heroCount: 0,
      });
    },
    checkBalance: async (): Promise<void> => {
      try {
        const state = get(wallet);
        if (state.tavernContract && state.account) {
          const balance = await state.tavernContract["balanceOf"](state.account);
          update((state) => ({
            ...state,
            heroCount: Number(balance),
          }));
          console.log("Updated hero count:", Number(balance));
        }
      } catch (error) {
        console.error("Error checking balance:", error);
      }
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
