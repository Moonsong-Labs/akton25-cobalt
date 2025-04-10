<script>
  import { onMount } from "svelte";
  import { ethers } from "ethers";
  import "./styles.css";

  let isConnected = false;
  let account = "";
  let provider;
  let questStatus = "not_joined"; // not_joined, pending, accepted, rejected
  let currentRound = 1;
  let maxRounds = 3;
  let isLoading = false;
  let showHistory = false;
  let actionHistory = [];

  let roundDescriptions = {
    1: "You find yourself at the entrance of a dark cave. The air is thick with the scent of damp earth and something... ancient.",
    2: "Deep within the cave, you encounter a mysterious altar with glowing runes.",
    3: "The final chamber reveals a treasure chest, but something feels off..."
  };

  const allActions = [
    { 
      id: "romance", 
      label: "Charm the mysterious figure with your wit",
      subtext: "(Romance Action)",
      function: "romanceTask()"
    },
    { 
      id: "fight", 
      label: "Draw your sword and charge into battle",
      subtext: "(Fight Action)",
      function: "fightTask()"
    },
    { 
      id: "bribe", 
      label: "Offer a pouch of gold for safe passage",
      subtext: "(Bribe Action - 0.01 ETH)",
      function: "bribeTask()"
    },
    { 
      id: "persuade", 
      label: "Attempt to reason with the guardian",
      subtext: "(Persuade Action)",
      function: "persuadeTask()"
    },
    { 
      id: "sneak", 
      label: "Use the shadows to slip past unnoticed",
      subtext: "(Sneak Action)",
      function: "sneakTask()"
    }
  ];

  async function connectWallet() {
    try {
      if (window.ethereum) {
        provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        account = accounts[0];
        isConnected = true;
      } else {
        alert("Please install MetaMask to use this application!");
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  }

  async function joinQuest() {
    try {
      questStatus = "pending";
      // Simulating blockchain response
      setTimeout(() => {
        questStatus = "accepted";
      }, 2000);
    } catch (error) {
      console.error("Error joining quest:", error);
      questStatus = "rejected";
    }
  }

  async function performAction(action) {
    try {
      isLoading = true;
      // Simulate blockchain interaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      actionHistory.push({
        round: currentRound,
        action: action.label,
        description: roundDescriptions[currentRound]
      });

      if (currentRound < maxRounds) {
        currentRound++;
      } else {
        showHistory = true;
      }
    } catch (error) {
      console.error("Error performing action:", error);
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Dungeons & Dragons - OnChain Adventures</title>
  <link
    href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=MedievalSharp&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div class="max-w-7xl mx-auto px-8 py-16">
  <header class="text-center mb-12">
    <h1 class="text-6xl font-medieval text-dnd-gold mb-2">
      Dungeons & Dragons
    </h1>
    <h2 class="text-3xl text-dnd-copper">OnChain Adventures</h2>
  </header>

  <main>
    <div class="mb-12">
      {#if !isConnected}
        <button class="connect-button" on:click={connectWallet}>
          <span>Connect Wallet</span>
          <span class="text-2xl">⚔️</span>
        </button>
      {:else}
        <div class="connected-wallet">
          <span class="wallet-address"
            >Connected: {account.slice(0, 6)}...{account.slice(-4)}</span
          >
        </div>
      {/if}
    </div>

    {#if isConnected}
      {#if !showHistory}
        <div class="game-section">
          {#if questStatus === "not_joined"}
            <div class="text-center">
              <button class="quest-button" on:click={joinQuest}>
                <span>Join the Quest</span>
                <span class="text-2xl">🏰</span>
              </button>
            </div>
          {:else if questStatus === "pending"}
            <div class="quest-status">
              <p class="text-xl text-dnd-gold">Awaiting the Council's decision...</p>
              <div class="loading-spinner"></div>
            </div>
          {:else if questStatus === "rejected"}
            <div class="quest-status">
              <p class="text-xl text-dnd-gold">The Council has deemed you not ready for this quest.</p>
              <p class="text-dnd-copper">Return when the stars align differently, brave adventurer.</p>
              <button class="quest-button mt-4" on:click={joinQuest}>
                <span>Try Again</span>
                <span class="text-2xl">🔄</span>
              </button>
            </div>
          {:else if questStatus === "accepted"}
            <div class="quest-progress">
              <div class="round-indicator">
                {#each Array(maxRounds) as _, i}
                  <div class="round-dot {i + 1 === currentRound ? 'active' : ''}"></div>
                {/each}
              </div>
              
              <div class="round-content">
                <h3 class="text-3xl font-medieval text-dnd-gold mb-6">
                  Round {currentRound}
                </h3>
                <p class="text-xl mb-8">{roundDescriptions[currentRound]}</p>
                
                <div class="action-buttons">
                  {#each allActions as action}
                    <button 
                      class="action-button" 
                      on:click={() => performAction(action)}
                      disabled={isLoading}
                    >
                      <span class="action-label">{action.label}</span>
                      <span class="action-subtext">{action.subtext}</span>
                      {#if isLoading}
                        <div class="button-spinner"></div>
                      {/if}
                    </button>
                  {/each}
                </div>
              </div>
            </div>
          {/if}
        </div>
      {:else}
        <div class="history-section">
          <h3 class="text-3xl font-medieval text-dnd-gold mb-6 text-center">
            Your Quest Chronicle
          </h3>
          <div class="history-timeline">
            {#each actionHistory as entry, i}
              <div class="history-entry">
                <div class="history-round">Round {entry.round}</div>
                <div class="history-description">{entry.description}</div>
                <div class="history-action">You chose to: {entry.action}</div>
              </div>
            {/each}
          </div>
          <div class="text-center mt-8">
            <button class="quest-button" on:click={() => {
              currentRound = 1;
              actionHistory = [];
              showHistory = false;
            }}>
              <span>Begin New Quest</span>
              <span class="text-2xl">🔄</span>
            </button>
          </div>
        </div>
      {/if}
    {/if}
  </main>
</div>
