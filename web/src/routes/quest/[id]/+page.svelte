<script lang="ts">
  import { onMount } from 'svelte';
  // Revert to relative paths
  import { quest } from '../../../stores/quest';
  import { wallet } from '../../../stores/wallet';
  import type { Hero } from '../../../stores/wallet';
  import QuestHistory from '../../../components/QuestHistory.svelte';

  // Remove temporary page declaration
  // declare const page: any;

  let questId: number | null = null;
  let selectedHero: Hero | null = null;

  // Derive selectedHero from wallet store
  $: {
    if ($wallet.selectedHeroId !== null) {
      selectedHero = $wallet.userHeroes.find((h: Hero) => h.id === $wallet.selectedHeroId) ?? null;
    } else {
      selectedHero = null;
    }
  }

  // Get questId from URL on mount
  onMount(() => {
    let idParam: string | undefined;
    try {
       idParam = window.location.pathname.split('/').pop();
       if (!idParam) throw new Error("Could not extract ID from URL");
    } catch (e) {
        console.error("Failed to get quest ID from URL:", e);
        window.location.href = '/quests'; // Navigate back
        return;
    }

    const currentQuestId = parseInt(idParam, 10);

    if (!isNaN(currentQuestId)) {
      questId = currentQuestId;
      if (!$quest.selectedQuestDetails || $quest.selectedQuestDetails.id !== questId) {
        quest.loadQuestDetails(questId);
      }
    } else {
      console.error("Invalid quest ID parsed from URL:", idParam);
      window.location.href = '/quests'; // Navigate back
    }
  });

  function handleJoinQuest() {
    if (questId !== null) {
      quest.joinQuestOnChain(questId);
    }
  }

  function handleTryAgain() {
    quest.clearSelectedQuest();
    window.location.href = '/quests';
  }

</script>

<!-- Corrected Structure -->
{#if $quest.isLoading || !$quest.selectedQuestDetails || $quest.selectedQuestDetails.id !== questId}
  <!-- Loading State -->
  <div class="quest-status">
    <p class="text-xl text-dnd-gold">Loading Quest Details...</p>
    <div class="loading-spinner"></div>
  </div>
{:else}
  <!-- Content When Details are Loaded -->
  {#if $quest.showHistory}
      <!-- History View -->
      <QuestHistory
        actionHistory={$quest.actionHistory}
        on:reset={quest.goBackToQuest}
      />
  {:else}
      <!-- Main Quest View -->
      <div class="quest-detail-container">
        <h1 class="quest-title">{$quest.selectedQuestDetails.name}</h1>
        <p class="quest-description mb-6">{$quest.selectedQuestDetails.description}</p>

        {#if !selectedHero}
          <div class="quest-status">
            <p class="text-xl text-dnd-gold mb-4">Select a hero from the Tavern to begin this quest!</p>
            <div class="text-center">
              <button class="quest-button" disabled><span>Join the Quest</span><span class="text-2xl">⚔️ </span></button>
            </div>
          </div>
        {:else if $quest.status === "not_joined"}
          <div class="text-center">
            <button class="quest-button" on:click={handleJoinQuest} disabled={$quest.isJoining}>
              {#if $quest.isJoining}
                <span>Joining...</span><div class="button-spinner small"></div>
              {:else}
                <span>Join Quest On-Chain</span><span class="text-2xl">🔗 </span>
              {/if}
            </button>
          </div>
        {:else if $quest.status === "pending"}
          <div class="quest-status">
            <p class="text-xl text-dnd-gold">Awaiting the Council's decision...</p>
            <div class="loading-spinner"></div>
          </div>
        {:else if $quest.status === "rejected"}
          <div class="quest-status">
            <p class="text-xl text-dnd-gold">The Council has deemed you not ready for this quest.</p>
            <p class="text-dnd-copper">Perhaps train more or choose a different path.</p>
            <button class="quest-button mt-4" on:click={handleTryAgain}>
              <span>Return to Quest List</span><span class="text-2xl">↩️</span>
            </button>
          </div>
        {:else if $quest.status === "accepted"}
          <div class="quest-progress">
            <div class="round-indicator">
              {#each Array($quest.selectedQuestDetails.maxRounds) as _, i}
                <div class="round-dot {i + 1 === $quest.currentRound ? 'active' : ''} {i + 1 < $quest.currentRound ? 'completed' : ''}"></div>
              {/each}
            </div>
            <div class="round-content">
              <h3 class="text-3xl font-medieval text-dnd-gold mb-6">Round {$quest.currentRound}</h3>
              <p class="text-xl mb-8">{$quest.selectedQuestDetails.roundDescriptions[$quest.currentRound] || 'The path ahead is unclear...'}</p>
              <div class="action-buttons">
                {#each $quest.selectedQuestDetails.allActions as action (action.id)}
                  <button class="action-button" on:click={() => quest.performAction(action)} disabled={$quest.isPerformingAction}>
                    <span class="action-label">{action.label}</span>
                    <span class="action-subtext">{action.subtext}</span>
                    {#if $quest.isPerformingAction}<div class="button-spinner small"></div>{/if}
                  </button>
                {/each}
              </div>
            </div>
            <div class="quest-hero-summary">
              <div class="quest-hero-image-container">
                {#if selectedHero.imagePath}
                  <img src={selectedHero.imagePath} alt={selectedHero.name} class="quest-hero-image" />
                {:else}
                  <div class="quest-hero-image-placeholder"><span>⚔️</span></div>
                {/if}
              </div>
              <div class="quest-hero-details">
                <div class="quest-hero-header">
                  <span class="quest-hero-name">{selectedHero.name}</span>
                  <span class="quest-hero-level">Lv. {selectedHero.level}</span>
                </div>
                <div class="quest-hero-stats">
                    <div class="quest-stat" title="Strength"><span class="quest-stat-icon">⚔️</span><span class="quest-stat-value">{selectedHero.stats.strength}</span></div>
                    <div class="quest-stat" title="Dexterity"><span class="quest-stat-icon">🏹</span><span class="quest-stat-value">{selectedHero.stats.dexterity}</span></div>
                    <div class="quest-stat" title="Will Power"><span class="quest-stat-icon">✨</span><span class="quest-stat-value">{selectedHero.stats.willPower}</span></div>
                    <div class="quest-stat" title="Intelligence"><span class="quest-stat-icon">🧠</span><span class="quest-stat-value">{selectedHero.stats.intelligence}</span></div>
                    <div class="quest-stat" title="Charisma"><span class="quest-stat-icon">👑</span><span class="quest-stat-value">{selectedHero.stats.charisma}</span></div>
                    <div class="quest-stat" title="Constitution"><span class="quest-stat-icon">🛡️</span><span class="quest-stat-value">{selectedHero.stats.constitution}</span></div>
                </div>
              </div>
            </div>
          </div>
        {/if}
      </div>
  {/if}
{/if}

<style>
 /* Styles remain the same */
 .quest-detail-container {
    max-width: 900px;
    margin: 2rem auto;
    padding: 2rem;
    background: rgba(15, 10, 5, 0.7);
    border: 1px solid rgba(255, 215, 0, 0.2);
    border-radius: 8px;
    font-family: 'Cinzel', serif;
    color: #f0e6d2;
  }

  .quest-title {
    text-align: center;
    font-size: 2.8rem;
    color: #ffd700;
    margin-bottom: 1rem;
    font-family: 'MedievalSharp', cursive;
  }

  .quest-description {
      text-align: center;
      font-size: 1.1rem;
      color: #d1c0a8;
      max-width: 700px;
      margin-left: auto;
      margin-right: auto;
      margin-bottom: 2.5rem;
      line-height: 1.6;
  }

  .quest-status {
    text-align: center;
    padding: 2rem;
    background-color: rgba(0,0,0,0.2);
    border-radius: 6px;
    margin-top: 1rem;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    margin: 20px auto;
    border: 4px solid #666;
    border-top: 4px solid #d4af37;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .quest-button, .action-button {
    background: linear-gradient(135deg, #8b4513 0%, #654321 100%);
    border: 2px solid #d4af37;
    border-radius: 0.5rem;
    padding: 1rem 2rem;
    color: #f0e6d2;
    font-size: 1.25rem;
    font-family: "Cinzel", serif;
    cursor: pointer;
    transition: all 0.3s;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    text-decoration: none;
    min-width: 200px;
  }

  .quest-button:hover:not(:disabled), .action-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    border-color: #ffd700;
  }

  .quest-button:disabled, .action-button:disabled {
    background: linear-gradient(135deg, #4a4a4a 0%, #2a2a2a 100%);
    border-color: #666;
    color: #999;
    cursor: not-allowed;
    opacity: 0.7;
  }

  .action-buttons {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    margin-top: 2rem;
  }

  .action-button {
    flex-direction: column;
    padding: 1.2rem 1rem;
    font-size: 1.1rem;
    min-height: 100px;
    align-items: center;
    justify-content: center;
  }

  .action-label {
    font-weight: bold;
    display: block;
  }

  .action-subtext {
    font-size: 0.9em;
    opacity: 0.8;
    display: block;
    margin-top: 0.25rem;
  }

  .button-spinner {
      border: 3px solid rgba(240, 230, 210, 0.3);
      border-top-color: #f0e6d2;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      animation: spin 0.8s linear infinite;
  }
  .button-spinner.small {
      width: 16px;
      height: 16px;
      border-width: 2px;
  }

  .quest-progress {
    margin-top: 2rem;
  }

  .round-indicator {
    display: flex;
    justify-content: center;
    margin-bottom: 2.5rem;
  }

  .round-dot {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background-color: #8b4513;
    margin: 0 8px;
    transition: all 0.3s ease;
    border: 1px solid rgba(212, 175, 55, 0.5);
  }

  .round-dot.active {
    background-color: #d4af37;
    transform: scale(1.3);
    box-shadow: 0 0 8px #d4af37;
  }

  .round-dot.completed {
    background-color: #a0522d;
    border-color: rgba(160, 82, 45, 0.8);
  }

  .round-content {
    background: rgba(42, 26, 18, 0.6);
    padding: 2rem;
    border-radius: 6px;
    border: 1px solid rgba(255, 215, 0, 0.1);
    margin-bottom: 2rem;
    text-align: center;
  }

  .quest-hero-summary {
    background: rgba(42, 26, 18, 0.9);
    padding: 1rem 1.5rem;
    border-radius: 6px;
    margin-top: 1.5rem;
    border: 1px solid rgba(255, 215, 0, 0.2);
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .quest-hero-image-container {
    width: 90px;
    height: 90px;
    flex-shrink: 0;
    border: 2px solid rgba(255, 215, 0, 0.4);
    border-radius: 8px;
    overflow: hidden;
    background-color: #1e160a;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  .quest-hero-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .quest-hero-image-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    color: rgba(255, 215, 0, 0.5);
  }

  .quest-hero-details {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
  }

  .quest-hero-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid rgba(255, 215, 0, 0.15);
  }

  .quest-hero-name {
    font-size: 1.3rem;
    color: #ffd700;
    font-family: "MedievalSharp", cursive;
  }

  .quest-hero-level {
    font-size: 0.9rem;
    color: #111;
    background: #ffd700;
    padding: 0.2rem 0.6rem;
    border-radius: 10px;
    font-weight: bold;
  }

  .quest-hero-stats {
    display: flex;
    justify-content: space-around;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .quest-stat {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.25rem 0.6rem;
    background: rgba(30, 15, 10, 0.6);
    border-radius: 4px;
    border: 1px solid rgba(255, 215, 0, 0.1);
    font-size: 0.95rem;
  }

  .quest-stat-icon {
    font-size: 1rem;
    opacity: 0.9;
  }

  .quest-stat-value {
    color: #fff;
    font-weight: 600;
    min-width: 18px;
    text-align: right;
  }

</style> 