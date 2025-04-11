import type { QuestContract, TavernContract } from "$lib/types/ethereum";
import { ethers } from "ethers";
import { get, writable } from "svelte/store";
import { wallet } from "./wallet";

interface Action {
  id: string;
  label: string;
  subtext: string;
  function: string;
  taskId: number;
}

interface ActionHistory {
  round: number;
  action: string;
  description: string;
}

interface EventLogEntry {
  message: string;
  timestamp: Date;
}

// Added QuestSummary interface
interface QuestSummary {
  id: number;
  name: string;
  description: string;
  maxRounds: number;
  roundDescriptions: Record<number, string>;
  allActions: Action[];
}

interface QuestState {
  status: "not_joined" | "pending" | "accepted" | "rejected";
  currentQuestId: number | null; // Added to track active quest
  currentRound: number;
  maxRounds: number;
  isLoading: boolean;
  showHistory: boolean;
  actionHistory: ActionHistory[];
  activeQuests: Array<{ id: number; status: string; currentRound: number }>; // Keep this? Maybe relevant for on-chain status checks later.
  eventLog: EventLogEntry[];
  roundDescriptions: Record<number, string>; // For the currently active quest
  allActions: Action[]; // For the currently active quest
  availableQuestsDetails: QuestSummary[]; // Added: Details of quests available to join
}

// Added constant for available quests
const AVAILABLE_QUEST_IDS = [0, 1]; // TODO: Add more quest IDs (e.g., [0, 1]) when their JSON files exist

function createQuestStore() {
  // Moved initial descriptions/actions to constants for reset
  const initialRoundDescriptions = {
    1: "You find yourself at the entrance of a dark cave. The air is thick with the scent of damp earth and something... ancient.",
    2: "Deep within the cave, you encounter a mysterious altar with glowing runes.",
    3: "The final chamber reveals a treasure chest, but something feels off...",
  };
  const initialActions = [
    {
      id: "romance",
      label: "Charm the mysterious figure with your wit",
      subtext: "(Romance Action)",
      function: "romanceTask()",
      taskId: 0,
    },
    {
      id: "fight",
      label: "Draw your sword and charge into battle",
      subtext: "(Fight Action)",
      function: "fightTask()",
      taskId: 1,
    },
    {
      id: "bribe",
      label: "Offer a pouch of gold for safe passage",
      subtext: "(Bribe Action - 0.01 ETH)",
      function: "bribeTask()",
      taskId: 2,
    },
    {
      id: "persuade",
      label: "Attempt to reason with the guardian",
      subtext: "(Persuade Action)",
      function: "persuadeTask()",
      taskId: 3,
    },
    {
      id: "sneak",
      label: "Use the shadows to slip past unnoticed",
      subtext: "(Sneak Action)",
      function: "sneakTask()",
      taskId: 4,
    },
  ];

  const { subscribe, set, update } = writable<QuestState>({
    status: "not_joined",
    currentQuestId: null, // Initialize
    currentRound: 1,
    maxRounds: 3, // Default/placeholder
    isLoading: false,
    showHistory: false,
    actionHistory: [],
    activeQuests: [],
    eventLog: [],
    roundDescriptions: initialRoundDescriptions, // Placeholder until quest is joined
    allActions: initialActions, // Placeholder until quest is joined
    availableQuestsDetails: [], // Initialize
  });

  // Function to add events to the log
  function addToEventLog(message: string): void {
    update((state) => {
      const newLog = [...state.eventLog, { message, timestamp: new Date() }];
      // Limit log size
      return {
        ...state,
        eventLog: newLog.length > 100 ? newLog.slice(-100) : newLog,
      };
    });
  }

  // Function to set up event listeners
  function setupEventListeners() {
    const state = get(wallet);
    if (!state.questContract || !state.tavernContract) {
      console.warn("Contracts not available for event listener setup.");
      return;
    }

    try {
      // Quest Contract Events
      const questContract = state.questContract as unknown as QuestContract; // Fix: Cast to unknown first
      questContract.on("HeroEnrolled", (questId: bigint, heroId: bigint) => {
        addToEventLog(`Hero ${heroId.toString()} joined quest ${questId.toString()}`);
      });

      questContract.on(
        "QuestStatusUpdated",
        (questId: bigint, status: number) => {
          const statusText = status === 2 ? "completed" : "failed"; // Assuming 2 is completed
          addToEventLog(`Quest ${questId.toString()} ${statusText}`);
          // TODO: Potentially update quest state here based on on-chain events
        }
      );

      questContract.on(
        "TaskPerformed",
        (questId: bigint, heroId: bigint, task: number) => {
          // Find action label based on task ID if possible, otherwise use index
           const action = get(quest).allActions.find(a => a.taskId === task);
           const taskName = action ? action.label : `Task ${task}`;
           addToEventLog(
             `Hero ${heroId.toString()} performed ${taskName} in quest ${questId.toString()}`
           );
        }
      );

      // Tavern Contract Events
      const tavernContract = state.tavernContract as unknown as TavernContract; // Fix: Cast to unknown first
      tavernContract.on(
        "Transfer",
        (from: string, to: string, tokenId: bigint) => {
          if (from === ethers.ZeroAddress) {
            addToEventLog(`New hero ${tokenId.toString()} minted to ${to}`);
            // Optionally trigger refresh of user heroes in wallet store
          }
          // Handle other transfers if needed (e.g., hero trading)
        }
      );
      addToEventLog("Event listeners successfully attached.");
    } catch (error) {
        console.error("Error setting up event listeners:", error);
        addToEventLog("Error setting up listeners: " + (error as Error).message);
    }
  }

  // Function to remove event listeners
  function removeEventListeners() {
    const state = get(wallet);
     try {
        if (state.questContract) {
            (state.questContract as unknown as QuestContract).removeAllListeners();
        }
        if (state.tavernContract) {
            (state.tavernContract as unknown as TavernContract).removeAllListeners();
        }
        addToEventLog("Event listeners removed.");
    } catch (error) {
        console.error("Error removing event listeners:", error);
        addToEventLog("Error removing listeners: " + (error as Error).message);
    }
  }

    // Added: Function to load details for available quests
    async function loadAvailableQuests() {
        addToEventLog("Loading available quests...");
        try {
            // Ensure base path is correct, especially if deployed
            const basePath = window.location.origin;
            const questDetailsPromises = AVAILABLE_QUEST_IDS.map(async (id) => {
                // Use absolute path from origin if needed, or relative if files are served correctly
                // const url = `${basePath}/generated/json/quest/quest_${id}.json`;
                // *** CHANGED: Use relative path from web root ***
                const url = `/generated/json/quest/quest_${id}.json`;
                console.log("Attempting to fetch quest data from:", url); // Added for debugging
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
                }
                const data: QuestSummary = await response.json();
                 if (typeof data.id === 'undefined' || typeof data.name === 'undefined') {
                    console.warn(`Quest data for ID ${id} seems incomplete.`, data);
                    throw new Error(`Incomplete data for quest ID ${id}`);
                }
                return data;
            });
            const quests = await Promise.all(questDetailsPromises);
            update((state) => ({ ...state, availableQuestsDetails: quests }));
            addToEventLog(`Loaded ${quests.length} available quests.`);
        } catch (error) {
            console.error("Error loading available quests:", error);
            addToEventLog("Failed to load available quests: " + (error as Error).message);
             update((state) => ({ ...state, availableQuestsDetails: [] })); // Ensure it's empty on failure
        }
    }

  // *** ADDED: Call loadAvailableQuests immediately on store creation ***
  loadAvailableQuests();

  // Set up listeners and load quests when wallet connects/disconnects
  wallet.subscribe((state) => {
    if (state.isConnected && state.provider && state.questContract && state.tavernContract) {
        addToEventLog("Wallet connected. Setting up listeners and loading quests...");
        removeEventListeners(); // Clean up existing listeners first
        setupEventListeners();
        loadAvailableQuests(); // Load quests when connected
    } else {
        if (!state.isConnected) {
             addToEventLog("Wallet disconnected. Removing listeners and clearing quest data.");
        } else {
            addToEventLog("Wallet connected, but provider or contracts missing. Listeners/quests not loaded.");
        }
        removeEventListeners();
        update(s => ({ ...s, availableQuestsDetails: [], status: "not_joined", currentQuestId: null })); // Clear quests if disconnected or setup failed
    }
  });


  return {
    subscribe,
    // Updated joinQuest to accept questId
    joinQuest: async (questId: number): Promise<void> => {
        const questToJoin = get(quest).availableQuestsDetails.find(q => q.id === questId);
        if (!questToJoin) {
            addToEventLog(`Error: Cannot join Quest ${questId}. Details not found.`);
            console.error(`Quest details for ID ${questId} not found in availableQuestsDetails.`);
            return;
        }
      try {
        update((state) => ({ ...state, status: "pending", isLoading: true, currentQuestId: questId })); // Set currentQuestId here
        addToEventLog(`Joining Quest: ${questToJoin.name} (Offline Mode)...`);

        await new Promise((resolve) => setTimeout(resolve, 1000)); // Mock delay

        update((state) => ({
          ...state,
          status: "accepted",
          // currentQuestId: questId, // Already set above
          currentRound: 1,
          maxRounds: questToJoin.maxRounds,
          roundDescriptions: questToJoin.roundDescriptions,
          allActions: questToJoin.allActions,
          showHistory: false,
          actionHistory: [],
          isLoading: false,
        }));
        addToEventLog(`Successfully joined Quest: ${questToJoin.name} (Offline Mode)`);
      } catch (error) {
        console.error("Error joining quest (offline):", error);
        update((state) => ({ ...state, status: "rejected", isLoading: false, currentQuestId: null }));
        addToEventLog(`Failed to join Quest ${questId} (Offline): ` + (error as Error).message);
      }
    },
    // Updated joinQuestOnChain to accept questId and heroId
    joinQuestOnChain: async (questId: number, heroId: number): Promise<void> => {
        const questToJoin = get(quest).availableQuestsDetails.find(q => q.id === questId);
         if (!questToJoin) {
            addToEventLog(`Error: Cannot join Quest ${questId} on-chain. Details not found.`);
            console.error(`Quest details for ID ${questId} not found for on-chain join.`);
            return;
        }
        if (typeof heroId !== 'number') {
             addToEventLog(`Error: Invalid Hero ID provided for joining quest.`);
             console.error(`Invalid heroId: ${heroId}`);
             return;
        }

      try {
        update((state) => ({ ...state, status: "pending", isLoading: true, currentQuestId: questId }));
        addToEventLog(`Checking status of Quest ${questId} (${questToJoin.name}) before joining with Hero ${heroId}...`);

        const walletState = get(wallet);
        if (!walletState.questContract || !walletState.account || !walletState.provider) {
          throw new Error("Wallet not connected or contract/provider not initialized");
        }

        // *** ADDED: Check current quest status ***
        const currentQuestStatus = await walletState.questContract.status(questId);
        const QuestStatus_OPEN = 0; // Assuming 0 corresponds to OPEN enum in Solidity
        const QuestStatus_IN_PROGRESS = 1; // Assuming 1 corresponds to IN_PROGRESS

        if (currentQuestStatus !== QuestStatus_OPEN) {
            // Quest is not open (likely already joined/in progress or finished)
            if (currentQuestStatus === QuestStatus_IN_PROGRESS) {
                 addToEventLog(`Quest ${questId} is already in progress. Loading current state...`);
                 // TODO: Potentially fetch current round from contract if possible
                 // For now, assume round 1 if we enter this state unexpectedly
                 update((state) => ({
                   ...state,
                   status: "accepted",
                   currentRound: 1, // Or fetch actual round
                   maxRounds: questToJoin.maxRounds,
                   roundDescriptions: questToJoin.roundDescriptions,
                   allActions: questToJoin.allActions,
                   showHistory: false,
                   actionHistory: [],
                   isLoading: false,
                 }));
                 return; // Exit function, no need to join again
            } else {
                 // Handle other statuses (e.g., FINISHED) if necessary
                 throw new Error(`Quest ${questId} is not open for joining (current status: ${currentQuestStatus}).`);
            }
        }
        // *** END ADDED CHECK ***

        // Proceed with joining only if status is OPEN
        addToEventLog(`Quest ${questId} is open. Attempting to join with Hero ${heroId} on-chain...`);

        const signer = await walletState.provider.getSigner();
        if (!signer) {
          throw new Error("No signer available");
        }

        // Ensure contract is connected to signer
        const contractWithSigner = walletState.questContract.connect(signer) as QuestContract;

        // Estimate gas or handle potential failures more gracefully
        // const gasEstimate = await contractWithSigner.estimateGas.joinQuest(questId, heroId);
        // console.log("Estimated gas:", gasEstimate.toString());

        const tx = await contractWithSigner.joinQuest(questId, heroId);
        addToEventLog(`Transaction sent: ${tx.hash}. Waiting for confirmation...`);
        const receipt = await tx.wait(); // Wait for the transaction to be mined
        addToEventLog(`Transaction confirmed in block ${receipt.blockNumber}! Successfully joined Quest ${questId} on-chain.`);

        update((state) => ({
          ...state,
          status: "accepted",
          // currentQuestId: questId, // Already set
          currentRound: 1, // Quest starts at round 1 after joining
          maxRounds: questToJoin.maxRounds,
          roundDescriptions: questToJoin.roundDescriptions,
          allActions: questToJoin.allActions,
          showHistory: false,
          actionHistory: [],
          isLoading: false,
        }));

      } catch (error: any) {
        console.error("Error joining quest on-chain:", error);
        let errorMessage = "An unknown error occurred";
         if (error.reason) {
            errorMessage = error.reason;
         } else if (error.message) {
             errorMessage = error.message;
         } else if (error.data?.message) {
             errorMessage = error.data.message; // Handle contract revert reasons
         }
         // Extract revert reason if available
         const revertReasonMatch = errorMessage.match(/reverted with reason string '(.*?)'/);
         if (revertReasonMatch && revertReasonMatch[1]) {
            errorMessage = revertReasonMatch[1];
         }

        update((state) => ({ ...state, status: "rejected", isLoading: false, currentQuestId: null }));
        addToEventLog(
          `Failed to join Quest ${questId} on-chain: ${errorMessage}`
        );
      }
    },
    performAction: async (action: Action): Promise<void> => {
        const currentQuestId = get(quest).currentQuestId;
        if (currentQuestId === null) {
             addToEventLog("Cannot perform action: No active quest.");
             return;
        }
      update((state) => ({ ...state, isLoading: true }));
      addToEventLog(`Performing action: ${action.label}...`);
      try {
        // TODO: Implement on-chain action performing logic
        // Example:
        // const walletState = get(wallet);
        // const signer = walletState.provider?.getSigner();
        // const contractWithSigner = walletState.questContract?.connect(signer);
        // const tx = await contractWithSigner.performTask(currentQuestId, selectedHeroId, action.taskId);
        // await tx.wait();

        await new Promise((resolve) => setTimeout(resolve, 1500)); // Mock delay for now

        let questCompleted = false;
        update((state) => {
          const newHistory: ActionHistory[] = [
            ...state.actionHistory,
            {
              round: state.currentRound,
              action: action.label,
              description: state.roundDescriptions[state.currentRound] || `Completed round ${state.currentRound}`,
            },
          ];

          const isQuestComplete = state.currentRound === state.maxRounds;
          const newRound = isQuestComplete
            ? state.currentRound // Stay on the last round if complete
            : state.currentRound + 1;

           questCompleted = isQuestComplete; // Store completion status

          return {
            ...state,
            actionHistory: newHistory,
            currentRound: newRound,
            showHistory: isQuestComplete, // Show history only when quest is fully complete
            isLoading: false,
          };
        });

         addToEventLog(`Action '${action.label}' successful.`);
         if (questCompleted) {
             addToEventLog(`Quest ${currentQuestId} completed! View the summary.`);
             // Maybe trigger something else on completion? Award XP?
         } else {
             addToEventLog(`Proceeding to round ${get(quest).currentRound}.`);
         }

      } catch (error) {
        console.error("Error performing action:", error);
        update((state) => ({ ...state, isLoading: false }));
        addToEventLog("Failed to perform action: " + (error as Error).message);
      }
    },
    checkUserQuests: async (): Promise<void> => {
      // This function likely needs to interact with the QuestContract
      // to get the status of quests the user's heroes are enrolled in.
      // Placeholder implementation.
      addToEventLog("Checking user's active quests (mock)...");
      try {
        update((state) => ({
          ...state,
          // Replace with actual contract calls to fetch hero quest statuses
          activeQuests: [
            // Example: { id: 1, status: "IN_PROGRESS", currentRound: 2 },
          ],
        }));
      } catch (error) {
        console.error("Error checking quests:", error);
         addToEventLog("Failed to check user quests: " + (error as Error).message);
      }
    },
    // Resets the state for starting a *new* quest, keeps logs and connection.
    resetQuest: (): void => {
      update((state) => ({
        ...state, // Keep eventLog, availableQuestsDetails, activeQuests etc.
        status: "not_joined",
        currentQuestId: null,
        currentRound: 1,
        maxRounds: 3, // Reset to default placeholder
        isLoading: false,
        showHistory: false,
        actionHistory: [],
        roundDescriptions: initialRoundDescriptions, // Reset to placeholder
        allActions: initialActions, // Reset to placeholder
      }));
       addToEventLog("Ready to start a new quest.");
    },
    // Maybe rename this? If it's just closing the history view...
    goBackToQuest: (): void => {
      update((state) => ({
        ...state,
        showHistory: false,
        // Don't reset round/history here, let resetQuest handle full resets.
      }));
    },
    addToEventLog,
    // Expose load function if manual refresh is desired
    loadAvailableQuests,
  };
}

export const quest = createQuestStore();
