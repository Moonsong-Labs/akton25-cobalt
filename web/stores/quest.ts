import { writable, get } from "svelte/store";
import { wallet } from "./wallet";
import { ethers } from "ethers";
import type { QuestContract } from "$lib/types/ethereum";

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

interface QuestState {
  status: "not_joined" | "pending" | "accepted" | "rejected";
  currentRound: number;
  maxRounds: number;
  isLoading: boolean;
  showHistory: boolean;
  actionHistory: ActionHistory[];
  activeQuests: Array<{ id: number; status: string; currentRound: number }>;
  eventLog: EventLogEntry[];
  roundDescriptions: Record<number, string>;
  allActions: Action[];
}

function createQuestStore() {
  const { subscribe, set, update } = writable<QuestState>({
    status: "not_joined",
    currentRound: 1,
    maxRounds: 3,
    isLoading: false,
    showHistory: false,
    actionHistory: [],
    activeQuests: [],
    eventLog: [],
    roundDescriptions: {
      1: "You find yourself at the entrance of a dark cave. The air is thick with the scent of damp earth and something... ancient.",
      2: "Deep within the cave, you encounter a mysterious altar with glowing runes.",
      3: "The final chamber reveals a treasure chest, but something feels off...",
    },
    allActions: [
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
    ],
  });

  return {
    subscribe,
    joinQuest: async (): Promise<void> => {
      try {
        update((state) => ({ ...state, status: "pending", isLoading: true }));

        await new Promise((resolve) => setTimeout(resolve, 2000));

        update((state) => ({
          ...state,
          status: "accepted",
          currentRound: 1,
          showHistory: false,
          actionHistory: [],
          isLoading: false,
        }));
      } catch (error) {
        console.error("Error joining quest:", error);
        update((state) => ({ ...state, status: "rejected", isLoading: false }));
      }
    },
    joinQuestOnChain: async (): Promise<void> => {
      try {
        update((state) => ({ ...state, status: "pending", isLoading: true }));

        const state = get(wallet);
        if (!state.questContract || !state.account) {
          throw new Error("Wallet not connected or contract not initialized");
        }

        // Get the signer from the provider
        const signer = await state.provider?.getSigner();
        if (!signer) {
          throw new Error("No signer available");
        }

        // Connect the contract with the signer
        const contractWithSigner = state.questContract.connect(
          signer
        ) as QuestContract;

        // my ids
        // id: "019622c6-2245-771a-b457-ab1faf090f4c",
        // user_id: "d98668a6-d0c7-4e6d-a473-8881a2991519",

        // Call the joinQuest function on the smart contract
        const questId = 0;
        const heroId = 4;
        const tx = await contractWithSigner.joinQuest(questId, heroId); // TODO: Replace with actual questId and heroId
        await tx.wait(); // Wait for the transaction to be mined

        update((state) => ({
          ...state,
          status: "accepted",
          currentRound: 1,
          showHistory: false,
          actionHistory: [],
          isLoading: false,
        }));

        // Add to event log
        quest.addToEventLog("Successfully joined quest on-chain!");
      } catch (error) {
        console.error("Error joining quest on-chain:", error);
        update((state) => ({ ...state, status: "rejected", isLoading: false }));
        quest.addToEventLog(
          "Failed to join quest on-chain: " + (error as Error).message
        );
      }
    },
    performAction: async (action: Action): Promise<void> => {
      update((state) => ({ ...state, isLoading: true }));
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        update((state) => {
          const newHistory: ActionHistory[] = [
            ...state.actionHistory,
            {
              round: state.currentRound,
              action: action.label,
              description: state.roundDescriptions[state.currentRound] || "",
            },
          ];

          const isQuestComplete = state.currentRound === state.maxRounds;
          const newRound = isQuestComplete
            ? state.currentRound
            : state.currentRound + 1;

          return {
            ...state,
            actionHistory: newHistory,
            currentRound: newRound,
            showHistory: isQuestComplete,
            isLoading: false,
          };
        });
      } catch (error) {
        console.error("Error performing action:", error);
        update((state) => ({ ...state, isLoading: false }));
      }
    },
    checkUserQuests: async (): Promise<void> => {
      try {
        update((state) => ({
          ...state,
          activeQuests: [
            { id: 1, status: "IN_PROGRESS", currentRound: 2 },
            { id: 2, status: "OPEN", currentRound: 0 },
          ],
        }));
      } catch (error) {
        console.error("Error checking quests:", error);
      }
    },
    addToEventLog: (message: string): void => {
      update((state) => {
        const newLog = [...state.eventLog, { message, timestamp: new Date() }];
        return {
          ...state,
          eventLog: newLog.length > 50 ? newLog.slice(-50) : newLog,
        };
      });
    },
    resetQuest: (): void => {
      set({
        status: "not_joined",
        currentRound: 1,
        maxRounds: 3,
        isLoading: false,
        showHistory: false,
        actionHistory: [],
        activeQuests: [],
        eventLog: [],
        roundDescriptions: {
          1: "You find yourself at the entrance of a dark cave. The air is thick with the scent of damp earth and something... ancient.",
          2: "Deep within the cave, you encounter a mysterious altar with glowing runes.",
          3: "The final chamber reveals a treasure chest, but something feels off...",
        },
        allActions: [
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
        ],
      });
    },
    goBackToQuest: (): void => {
      update((state) => ({
        ...state,
        showHistory: false,
        currentRound: 1,
        actionHistory: [],
      }));
    },
  };
}

export const quest = createQuestStore();
