import { BrowserProvider, Contract, ethers } from "ethers";
import { get, writable } from "svelte/store";
import Quest from "../../contracts/out/Quest.sol/Quest.json";
import Tavern from "../../contracts/out/Tavern.sol/Tavern.json";

interface HeroStats {
  strength: number;
  dexterity: number;
  willPower: number;
  intelligence: number;
  charisma: number;
  constitution: number;
}

interface Hero {
  id: number;
  name: string;
  level: number;
  imagePath: string | null;
  description: string;
  cooldown: number;
  stats: HeroStats;
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
// const TEST_ADDRESS = "0xb764428a29EAEbe8e2301F5924746F818b331F5A";
const TEST_ADDRESS = null;

if (!QUEST_ADDRESS || !TAVERN_ADDRESS) {
  throw new Error(
    "Missing required environment variables: VITE_QUEST_ADDRESS and/or VITE_TAVERN_ADDRESS"
  );
}

// Base path for generated assets - use web-relative paths now
const JSON_DIR_PATH = "/generated/json";
const IMAGE_DIR_PATH = "/generated/images";

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
      console.log("Connecting wallet...");
      try {
        if (window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await provider.send("eth_requestAccounts", []);
          console.log("accounts", accounts);
          const account = TEST_ADDRESS || accounts[0];

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

          // Load user's heroes using the combined approach
          const userHeroes = await loadUserHeroes(tavernContract, account);
          console.log("Loaded combined heroes:", userHeroes);

          set({
            isConnected: true,
            account,
            provider,
            questContract,
            tavernContract,
            userHeroes,
            heroCount: userHeroes.length,
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
      console.log("Disconnecting wallet...");
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
    refreshHeroes: async (): Promise<void> => {
      try {
        console.log("Refreshing heroes...");

        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        console.log("accounts", accounts);
        const account = TEST_ADDRESS || accounts[0];

        const tavernContract = new ethers.Contract(
          TAVERN_ADDRESS,
          Tavern.abi,
          provider
        );

        console.log("tavernContract", tavernContract);
        console.log("account", account);

        // Load user's heroes using the combined approach
        const userHeroes = await loadUserHeroes(tavernContract, account);
        console.log("userHeroes after refreshing provider", userHeroes);
        const state = get(wallet);
        state.userHeroes = userHeroes;
        state.heroCount = userHeroes.length;
        // update(() => state);
        update((state) => ({
          ...state,
          userHeroes,
          heroCount: userHeroes.length,
        }));
        console.log("Refreshed combined heroes:", userHeroes);
      } catch (error) {
        console.error("Error refreshing combined heroes:", error);
      }
    },
  };
}

// Rewrite loadUserHeroes to fetch on-chain data and merge with local metadata
async function loadUserHeroes(
  tavernContract: Contract,
  account: string
): Promise<Hero[]> {
  const heroes: Hero[] = [];
  try {
    console.log("Fetching hero balance from contract...");
    const balance = await tavernContract?.["balanceOf"]?.(account);
    console.log("balance", balance);
    const heroCount = Number(balance);
    console.log(`Found ${heroCount} heroes on-chain.`);

    if (heroCount === 0) {
      return [];
    }

    for (let i = 0; i < heroCount; i++) {
      const tokenId = await tavernContract?.["tokenOfOwnerByIndex"]?.(
        account,
        i
      );
      console.log(`Fetching info for tokenId: ${tokenId}`);
      const heroInfo = await tavernContract?.["heroInfo"]?.(tokenId);

      if (!heroInfo || !heroInfo.name) {
        console.warn(`Could not fetch heroInfo or name for tokenId ${tokenId}`);
        continue;
      }

      const contractHeroName = heroInfo.name;
      const metadataPath = `${JSON_DIR_PATH}/${contractHeroName}.json`;
      const imagePath = `${IMAGE_DIR_PATH}/${contractHeroName}.png`;

      let localName = contractHeroName; // Default to contract name
      let localDescription = "No description found."; // Default description
      let finalImagePath: string | null = null; // Default to null

      try {
        console.log(`Attempting to fetch local metadata: ${metadataPath}`);
        const metadataResponse = await fetch(metadataPath);

        if (metadataResponse.ok) {
          const localMetadata = await metadataResponse.json();
          console.log(
            `Successfully fetched local metadata for ${contractHeroName}`
          );

          // Use local data if available
          localName = localMetadata.name || localName;
          localDescription = localMetadata.description || localDescription;
          // Assume image exists if metadata exists - could add a check here if needed
          finalImagePath = imagePath;
        } else {
          console.warn(
            `Local metadata not found or failed to fetch for ${contractHeroName} at ${metadataPath} (Status: ${metadataResponse.status}). Using contract name and default description.`
          );
          // Keep defaults: contract name, default description, null image path
        }
      } catch (fetchError) {
        console.error(
          `Error fetching or parsing local metadata for ${contractHeroName} at ${metadataPath}:`,
          fetchError
        );
        // Keep defaults on error
      }

      // Combine on-chain and local/fallback data
      heroes.push({
        id: Number(tokenId),
        name: localName,
        level: Number(heroInfo.level),
        description: localDescription,
        imagePath: finalImagePath,
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
    }

    console.log("Successfully loaded and combined heroes:", heroes);
    return heroes;
  } catch (error) {
    console.error("Error loading combined user heroes:", error);
    return []; // Return empty array on error
  }
}

export const wallet = createWalletStore();
