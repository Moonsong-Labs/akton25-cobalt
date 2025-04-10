<script>
  import { onMount } from "svelte";
  import { ethers } from "ethers";
  import "./styles.css";

  let isConnected = false;
  let account = "";
  let provider;

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

    <div class="game-section">
      <div class="character-sheet">
        <h3 class="text-3xl font-medieval text-dnd-gold mb-6">
          Your Character
        </h3>
        <div class="character-stats">
          <!-- Character stats will go here -->
        </div>
      </div>
    </div>
  </main>
</div>
