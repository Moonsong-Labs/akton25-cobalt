<script>
  import { onMount } from "svelte";
  import "./styles.css";
  import Footer from "./components/Footer.svelte";
  import QuestLog from "./components/QuestLog.svelte";
  import Tavern from "./components/Tavern.svelte";
  import Background from "./components/Background.svelte";
  import QuestSection from "./components/QuestSection.svelte";
  import HeroSelection from "./components/HeroSelection.svelte";
  import { wallet } from "./stores/wallet.ts";
  import { quest } from "./stores/quest.ts";
  import MintHero from "./components/MintHero.svelte";

  let showQuestLog = false;
  let showTavern = false;
  let showConnectionPrompt = false;
  let promptMessage = "";
  let mainHero = null;
  let showWelcome = true;

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

  function handleSetMainHero(event) {
    mainHero = event.detail.hero;
  }

  function handleOpenTavern() {
    showTavern = true;
  }

  $: if ($wallet.isConnected) {
    showWelcome = false;
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
    {#if showWelcome}
      <div class="welcome-message">
        <div class="welcome-content">
          <h3 class="text-3xl font-medieval text-dnd-gold mb-6">
            Harken [AI]dventurer....
          </h3>
          <div class="welcome-text">
            <p class="mb-4">
              In this mystical realm, where magic flows through the very fabric
              of reality, a new chapter of adventure awaits!
            </p>

            <p class="mb-4">
              The ancient Tavern of Legends stands before you, its doors
              creaking with the weight of countless tales. Within its hallowed
              halls, heroes of old whisper secrets of untold riches and perilous
              quests.
            </p>

            <p class="mb-4">
              But beware! The path to glory is not for the faint of heart.
              You'll need a champion - a hero forged in the fires of destiny,
              ready to face the challenges that lie ahead.
            </p>

            <p class="mb-4">
              Connect your magical sigil (that's your wallet to you mortals) and
              step into a world where:
            </p>

            <ul class="welcome-list">
              <li>⚔️ Heroes rise from humble beginnings</li>
              <li>✨ Magic flows through every transaction</li>
              <li>🏰 The Tavern holds secrets untold</li>
              <li>📜 Quests await the bold and brave</li>
              <li>💎 Riches beyond imagination</li>
            </ul>

            <p class="mt-6">
              The dice are rolling, the ale is flowing, and destiny calls your
              name. Will you answer?
            </p>
          </div>
        </div>
      </div>
    {/if}

    <div class="mb-12">
      {#if !$wallet.isConnected}
        <button class="connect-button" on:click={wallet.connect}>
          <span>Connect Wallet</span>
          <span class="text-2xl">⚔️</span>
        </button>
      {:else}
        <div class="connected-wallet">
          <span class="wallet-address"
            >Your magical sigil has been inscribed: {$wallet.account.slice(
              0,
              6
            )}...{$wallet.account.slice(-4)}</span
          >
        </div>
      {/if}
    </div>

    {#if $wallet.isConnected}
      <HeroSelection {mainHero} on:openTavern={handleOpenTavern} />
      <QuestSection {mainHero} />
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
    {mainHero}
    on:close={() => (showTavern = false)}
    on:setMainHero={handleSetMainHero}
  />
  <Footer
    isConnected={$wallet.isConnected}
    {handleNavClick}
    eventLog={$quest.eventLog}
    {showQuestLog}
  />
</div>

<style>
  .welcome-message {
    background: radial-gradient(ellipse at center, #2e2216 0%, #1c140d 100%);
    border: 2px solid rgba(255, 215, 0, 0.3);
    border-radius: 12px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
    position: relative;
    overflow: hidden;
  }

  .welcome-message::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffd700' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E");
    opacity: 0.1;
  }

  .welcome-content {
    position: relative;
    z-index: 1;
  }

  .welcome-text {
    color: #f0e6d2;
    font-size: 1.1rem;
    line-height: 1.6;
    text-align: center;
    max-width: 800px;
    margin: 0 auto;
  }

  .welcome-list {
    list-style: none;
    padding: 0;
    margin: 1.5rem 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    align-items: center;
  }

  .welcome-list li {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #d4af37;
    font-size: 1.1rem;
  }

  .welcome-list li::before {
    content: "✨";
    font-size: 1.2rem;
  }
</style>
