<script>
  import { onMount } from "svelte";
  import "./styles.css";
  import Footer from "./components/Footer.svelte";
  import QuestLog from "./components/QuestLog.svelte";
  import Tavern from "./components/Tavern.svelte";
  import Background from "./components/Background.svelte";
  import QuestSection from "./components/QuestSection.svelte";
  import { wallet } from "./stores/wallet.ts";
  import { quest } from "./stores/quest.ts";
  import MintHero from "./components/MintHero.svelte";

  let showQuestLog = false;
  let showTavern = false;
  let showConnectionPrompt = false;
  let promptMessage = "";

  function showPrompt(message) {
    promptMessage = message;
    showConnectionPrompt = true;
    setTimeout(() => {
      showConnectionPrompt = false;
    }, 3000);
  }

  function handleNavClick(type) {
    if (!$wallet.isConnected) {
      showPrompt("Connect your wallet to view the " + type);
    } else {
      if (type === "log") {
        showQuestLog = !showQuestLog;
      } else {
        showTavern = !showTavern;
      }
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

<div class="max-w-7xl mx-auto px-8 py-16 relative">
  <Background />
  <div class="content-overlay"></div>

  <header class="text-center mb-12 relative">
    <h1 class="text-6xl font-medieval text-dnd-gold mb-2">
      Dungeons & Dragons
    </h1>
    <h2 class="text-3xl text-dnd-copper">OnChain Adventures</h2>
  </header>

  <main>
    <div class="mb-12">
      {#if !$wallet.isConnected}
        <button class="connect-button" on:click={wallet.connect}>
          <span>Connect Wallet</span>
          <span class="text-2xl">⚔️</span>
        </button>
      {:else}
        <div class="connected-wallet">
          <span class="wallet-address"
            >Connected: {$wallet.account.slice(0, 6)}...{$wallet.account.slice(
              -4
            )}</span
          >
          <div class="hero-count">
            <span class="text-2xl">⚔️</span>
            <span>Heroes: {$wallet.heroCount}</span>
          </div>
          <MintHero />
        </div>
      {/if}
    </div>

    {#if $wallet.isConnected}
      <QuestSection />
    {/if}
  </main>

  <!-- Connection Prompt -->
  {#if showConnectionPrompt}
    <div class="connection-prompt">
      <p class="prompt-text">{promptMessage}</p>
    </div>
  {/if}

  <QuestLog
    {showQuestLog}
    eventLog={$quest.eventLog}
    on:close={() => (showQuestLog = false)}
  />
  <Tavern
    {showTavern}
    userHeroes={$wallet.userHeroes}
    on:close={() => (showTavern = false)}
  />
  <Footer isConnected={$wallet.isConnected} {handleNavClick} />
</div>

<style>
  /* ... existing styles ... */

  .hero-count {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0.5rem 0;
    color: var(--dnd-gold);
    font-family: "Cinzel", serif;
  }
</style>
