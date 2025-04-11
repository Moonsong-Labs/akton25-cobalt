<script>
  import { quest } from "../stores/quest";
  import QuestHistory from "./QuestHistory.svelte";
  export let mainHero = null;
</script>

{#if !$quest.showHistory}
  <div class="game-section">
    {#if !mainHero}
      <div class="quest-status">
        <p class="text-xl text-dnd-gold mb-4">
          Select a hero to begin your quest!
        </p>
        <div class="text-center">
          <button class="quest-button" disabled>
            <span>Join the Quest</span>
            <span class="text-2xl">⚔️ </span>
          </button>
        </div>
      </div>
    {:else if $quest.status === "not_joined"}
      <div class="text-center">
        <div class="button-group">
          <button class="quest-button" on:click={quest.joinQuest}>
            <span>Join the Quest (offline, to show user flow) </span>
            <span class="text-1xl">⚔️ </span>
          </button>
          <button class="quest-button" on:click={quest.joinQuestOnChain}>
            <span>Join the Quest On-Chain</span>
            <span class="text-2xl">🔗 </span>
          </button>
        </div>
      </div>
    {:else if $quest.status === "pending"}
      <div class="quest-status">
        <p class="text-xl text-dnd-gold">Awaiting the Council's decision...</p>
        <div class="loading-spinner"></div>
      </div>
    {:else if $quest.status === "rejected"}
      <div class="quest-status">
        <p class="text-xl text-dnd-gold">
          The Council has deemed you not ready for this quest.
        </p>
        <p class="text-dnd-copper">
          Return when the stars align differently, brave adventurer.
        </p>
        <button class="quest-button mt-4" on:click={quest.joinQuest}>
          <span>Try Again</span>
          <span class="text-2xl">🔄</span>
        </button>
      </div>
    {:else if $quest.status === "accepted"}
      {#if !$quest.showHistory}
        <div class="quest-progress">
          <div class="round-indicator">
            {#each Array($quest.maxRounds) as _, i}
              <div
                class="round-dot {i + 1 === $quest.currentRound
                  ? 'active'
                  : ''} {i + 1 < $quest.currentRound ? 'completed' : ''}"
              ></div>
            {/each}
          </div>

          <div class="round-content">
            <h3 class="text-3xl font-medieval text-dnd-gold mb-6">
              Round {$quest.currentRound}
            </h3>
            <p class="text-xl mb-8">
              {$quest.roundDescriptions[$quest.currentRound]}
            </p>

            <div class="action-buttons">
              {#each $quest.allActions as action}
                <button
                  class="action-button"
                  on:click={() => quest.performAction(action)}
                  disabled={$quest.isLoading}
                >
                  <span class="action-label">{action.label}</span>
                  <span class="action-subtext">{action.subtext}</span>
                  {#if $quest.isLoading}
                    <div class="button-spinner"></div>
                  {/if}
                </button>
              {/each}
            </div>
          </div>

          <div class="quest-hero-summary">
            <div class="quest-hero-header">
              <span class="quest-hero-name">{mainHero.name}</span>
              <span class="quest-hero-level">Lv. {mainHero.level}</span>
            </div>
            <div class="quest-hero-stats">
              <div class="quest-stat" title="Strength">
                <span class="quest-stat-icon">⚔️</span>
                <span class="quest-stat-value">{mainHero.stats.strength}</span>
              </div>
              <div class="quest-stat" title="Dexterity">
                <span class="quest-stat-icon">🏹</span>
                <span class="quest-stat-value">{mainHero.stats.dexterity}</span>
              </div>
              <div class="quest-stat" title="Will Power">
                <span class="quest-stat-icon">✨</span>
                <span class="quest-stat-value">{mainHero.stats.willPower}</span>
              </div>
              <div class="quest-stat" title="Intelligence">
                <span class="quest-stat-icon">🧠</span>
                <span class="quest-stat-value"
                  >{mainHero.stats.intelligence}</span
                >
              </div>
              <div class="quest-stat" title="Charisma">
                <span class="quest-stat-icon">👑</span>
                <span class="quest-stat-value">{mainHero.stats.charisma}</span>
              </div>
              <div class="quest-stat" title="Constitution">
                <span class="quest-stat-icon">🛡️</span>
                <span class="quest-stat-value"
                  >{mainHero.stats.constitution}</span
                >
              </div>
            </div>
          </div>
        </div>
      {/if}
    {/if}
  </div>
{:else}
  <QuestHistory
    actionHistory={$quest.actionHistory}
    currentRound={$quest.currentRound}
    showHistory={$quest.showHistory}
    on:reset={quest.goBackToQuest}
  />
{/if}

<style>
  .round-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: #8b4513;
    margin: 0 8px;
    transition: all 0.3s ease;
  }

  .round-dot.active {
    background-color: #d4af37;
    transform: scale(1.2);
  }

  .round-dot.completed {
    background-color: #d4af37;
  }

  .quest-status {
    text-align: center;
    padding: 2rem;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    margin: 20px auto;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #8b4513;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .quest-button {
    background: linear-gradient(135deg, #8b4513 0%, #654321 100%);
    border: 2px solid #d4af37;
    border-radius: 0.5rem;
    padding: 1rem 2rem;
    color: #f0e6d2;
    font-size: 1.25rem;
    font-family: "Cinzel", serif;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0 auto;
  }

  .quest-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }

  .quest-button:disabled {
    background: linear-gradient(135deg, #4a4a4a 0%, #2a2a2a 100%);
    border-color: #666;
    color: #999;
    cursor: not-allowed;
    opacity: 0.7;
  }

  .quest-hero-summary {
    background: rgba(42, 26, 18, 0.8);
    padding: 0.75rem;
    border-radius: 6px;
    margin-bottom: 1.5rem;
    border: 1px solid rgba(255, 215, 0, 0.1);
  }

  .quest-hero-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid rgba(255, 215, 0, 0.1);
  }

  .quest-hero-name {
    font-size: 1.2rem;
    color: #ffd700;
    font-family: "MedievalSharp", cursive;
  }

  .quest-hero-level {
    font-size: 0.9rem;
    color: #000;
    background: #ffd700;
    padding: 0.15rem 0.5rem;
    border-radius: 4px;
  }

  .quest-hero-stats {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .quest-stat {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.5rem;
    background: rgba(30, 15, 10, 0.5);
    border-radius: 4px;
    border: 1px solid rgba(255, 215, 0, 0.05);
  }

  .quest-stat-icon {
    font-size: 1rem;
  }

  .quest-stat-value {
    color: #fff;
    font-size: 1rem;
    font-weight: 600;
  }

  .button-group {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    margin: 0 auto;
    max-width: 300px;
  }
</style>
