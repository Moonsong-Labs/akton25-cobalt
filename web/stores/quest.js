import { writable } from "svelte/store";
import { wallet } from "./wallet";

function createQuestStore() {
  const { subscribe, set, update } = writable({
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
    joinQuest: async () => {
      try {
        // Set pending status
        update((state) => ({ ...state, status: "pending", isLoading: true }));

        // Simulate blockchain response
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Set accepted status and initialize quest state
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
    performAction: async (action) => {
      update((state) => ({ ...state, isLoading: true }));
      try {
        // Simulate blockchain interaction delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        update((state) => {
          const newHistory = [
            ...state.actionHistory,
            {
              round: state.currentRound,
              action: action.label,
              description: state.roundDescriptions[state.currentRound],
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
    checkUserQuests: async () => {
      try {
        // This would need to be implemented based on your contract's quest enumeration
        // For now, we'll simulate it
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
    addToEventLog: (message) => {
      update((state) => {
        const newLog = [...state.eventLog, { message, timestamp: new Date() }];
        return {
          ...state,
          eventLog: newLog.length > 50 ? newLog.slice(-50) : newLog,
        };
      });
    },
    resetQuest: () => {
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
    goBackToQuest: () => {
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
