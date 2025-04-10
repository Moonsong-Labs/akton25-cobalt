<script>
  import { quest } from "../stores/quest";
  import QuestHistory from "./QuestHistory.svelte";
</script>

<div class="game-section">
  {#if $quest.status === "not_joined"}
    <div class="text-center">
      <button class="quest-button" on:click={quest.joinQuest}>
        <span>Join the Quest</span>
        <span class="text-2xl">🏰</span>
      </button>
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
      </div>
    {/if}
  {/if}
</div>

{#if $quest.showHistory}
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
</style>
