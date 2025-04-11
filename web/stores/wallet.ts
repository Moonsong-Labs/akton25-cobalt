import { writable, get } from "svelte/store";
import { ethers, BrowserProvider, Contract } from "ethers";
import Quest from "../../contracts/out/Quest.sol/Quest.json";
import Tavern from "../../contracts/out/Tavern.sol/Tavern.json";

interface Hero {
  id: number;
  name: string;
  level: number;
  metadataUrl: string;
  cooldown: number;
  stats: {
    strength: number;
    dexterity: number;
    willPower: number;
    intelligence: number;
    charisma: number;
    constitution: number;
  };
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
const QUEST_ADDRESS = import.meta.env["VITE_QUEST_ADDRESS"] || "";
const TAVERN_ADDRESS = import.meta.env["VITE_TAVERN_ADDRESS"] || "";

// Temporary test address with 3 heroes
const TEST_ADDRESS = "0xb764428a29EAEbe8e2301F5924746F818b331F5A";

if (!QUEST_ADDRESS || !TAVERN_ADDRESS) {
  throw new Error(
    "Missing required environment variables: VITE_QUEST_ADDRESS and/or VITE_TAVERN_ADDRESS"
  );
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
          const account = TEST_ADDRESS; // Using test address for now

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

          let use_address = "";

          // @ts-ignore
          if (TEST_ADDRESS !== "") {
            use_address = account;
          }

          // Check hero balance
          const heroCount = await tavernContract?.["balanceOf"]?.(TEST_ADDRESS);
          console.log("Hero count:", heroCount?.toString());

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
          const balance = await state.tavernContract?.["balanceOf"]?.(
            state.account
          );
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
    console.log("tavernContract", tavernContract);
    const heroes: Hero[] = [];

    // Get the total number of heroes for the address
    const balance = await tavernContract?.["balanceOf"]?.(TEST_ADDRESS);
    const heroCount = Number(balance);

    // For each hero, get its token ID and information
    for (let i = 0; i < heroCount; i++) {
      const tokenId = await tavernContract?.["tokenOfOwnerByIndex"]?.(
        TEST_ADDRESS,
        i
      );
      const heroInfo = await tavernContract?.["heroInfo"]?.(tokenId);

      // console.log("heroInfo", heroInfo);

      heroes.push({
        id: Number(tokenId),
        name: heroInfo.name,
        level: Number(heroInfo.level),
        metadataUrl: heroInfo.metadataUrl,
        cooldown: Number(heroInfo.cooldown),
        stats: {
          strength: Number(heroInfo.stats.strength),
          dexterity: Number(heroInfo.stats.dexterity),
          willPower: Number(heroInfo.stats.willPower),
          intelligence: Number(heroInfo.stats.intelligence),
          charisma: Number(heroInfo.stats.charisma),
          constitution: Number(heroInfo.stats.constitution),
        },
      });

      console.log("heroes", heroes);
    }

    return heroes;
  } catch (error) {
    console.error("Error loading heroes:", error);
    return [];
  }
}

export const wallet = createWalletStore();
