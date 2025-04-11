<script>
  import { quest } from "../stores/quest";
  import QuestHistory from "./QuestHistory.svelte";
  export let mainHero = null; // Expects { id: number, name: string, ... }
</script>

{#if !$quest.showHistory}
  <div class="game-section">
    {#if !mainHero}
      <div class="quest-status">
        <p class="text-xl text-dnd-gold mb-4">
          Select a hero from the Tavern to begin your quest!
        </p>
        <!-- Optional: Add button to open Tavern -->
      </div>
    {:else if $quest.status === "not_joined"}
      <!-- Show Available Quests -->
      <div class="available-quests">
        <h3 class="text-3xl font-medieval text-dnd-gold mb-6 text-center">
          Available Quests for {mainHero.name}
        </h3>
        {#if $quest.availableQuestsDetails.length > 0}
          <div class="quest-list">
            {#each $quest.availableQuestsDetails as availableQuest}
              <div class="quest-card">
                <h4 class="text-2xl font-medieval text-dnd-gold mb-3">
                  {availableQuest.name}
                </h4>
                <p class="text-dnd-parchment mb-4">
                  {availableQuest.description}
                </p>
                <div class="button-group-horizontal">
                   <button
                     class="quest-button small"
                     on:click={() => quest.joinQuest(availableQuest.id)}
                     disabled={$quest.isLoading}
                   >
                    <span>Join (Offline)</span>
                    <span class="text-lg">⚔️</span>
                  </button>
                   <button
                     class="quest-button small"
                     on:click={() => quest.joinQuestOnChain(availableQuest.id, mainHero.id)}
                     disabled={$quest.isLoading || typeof mainHero.id !== 'number'}
                     title={typeof mainHero.id !== 'number' ? 'Hero ID is missing' : 'Join quest on the blockchain'}
                   >
                    <span>Join On-Chain</span>
                     <span class="text-lg">🔗</span>
                  </button>
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <p class="text-center text-dnd-copper">
             {#if $quest.isLoading}Loading available quests...{:else}No quests currently available at the Adventurer's Guild.{/if}
          </p>
        {/if}
      </div>
      <!-- Original Join Buttons (kept for reference/fallback if needed, but ideally replaced by above) -->
      <!--
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
            -->
    {:else if $quest.status === "pending"}
      <div class="quest-status">
        <p class="text-xl text-dnd-gold">Joining the quest...</p>
        <div class="loading-spinner"></div>
      </div>
    {:else if $quest.status === "rejected"}
      <div class="quest-status">
        <p class="text-xl text-dnd-gold">
          Failed to join the quest. Check the Quest Log for details.
        </p>
        <p class="text-dnd-copper mb-4">
          Perhaps try a different quest or ensure your hero is ready.
        </p>
        <button class="quest-button mt-4" on:click={quest.resetQuest}>
          <span>Back to Quest Selection</span>
          <span class="text-2xl">🗺️</span>
        </button>
      </div>
    {:else if $quest.status === "accepted"}
      {#if !$quest.showHistory}
        <div class="quest-progress">
          <div class="quest-header">
             <h3 class="text-3xl font-medieval text-dnd-gold">
                {$quest.availableQuestsDetails.find(q => q.id === $quest.currentQuestId)?.name || 'Ongoing Quest'} - Round {$quest.currentRound}
             </h3>
             <div class="round-indicator">
                {#each Array($quest.maxRounds) as _, i}
                <div
                   class="round-dot {i + 1 === $quest.currentRound
                   ? 'active'
                   : ''} {i + 1 < $quest.currentRound ? 'completed' : ''}"
                   title={`Round ${i + 1}${i + 1 < $quest.currentRound ? ' (Completed)' : ''}${i + 1 === $quest.currentRound ? ' (Active)' : ''}`}
                 ></div>
                {/each}
             </div>
          </div>


          <div class="round-content">
            <!-- <h3 class="text-3xl font-medieval text-dnd-gold mb-6">
                     Round {$quest.currentRound}
                     </h3> -->
            <p class="text-xl mb-8 round-description">
              {$quest.roundDescriptions[$quest.currentRound] ||
                "The path ahead is unclear..."}
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

          {#if mainHero}
            <div class="quest-hero-summary">
              <div class="quest-hero-image-container">
                {#if mainHero.imagePath}
                  <img
                    src={mainHero.imagePath}
                    alt={mainHero.name}
                    class="quest-hero-image"
                    onerror="this.onerror=null; this.src='https://placehold.co/100x100/2e2216/ffd700?text=Hero';"
                  />
                {:else}
                  <div class="quest-hero-image-placeholder">
                    <span>⚔️</span>
                  </div>
                {/if}
              </div>
              <div class="quest-hero-details">
                 <div class="quest-hero-header">
                   <span class="quest-hero-name">{mainHero.name}</span>
                   <span class="quest-hero-level">Lv. {mainHero.level || 1}</span>
                 </div>
                 <div class="quest-hero-stats">
                  <div class="quest-stat" title="Strength">
                    <span class="quest-stat-icon">⚔️</span>
                    <span class="quest-stat-value"
                      >{mainHero.stats?.strength || "?"}</span
                    >
                  </div>
                   <div class="quest-stat" title="Dexterity">
                    <span class="quest-stat-icon">🏹</span>
                    <span class="quest-stat-value"
                      >{mainHero.stats?.dexterity || "?"}</span
                    >
                  </div>
                   <div class="quest-stat" title="Will Power">
                    <span class="quest-stat-icon">✨</span>
                    <span class="quest-stat-value"
                      >{mainHero.stats?.willPower || "?"}</span
                    >
                  </div>
                   <div class="quest-stat" title="Intelligence">
                    <span class="quest-stat-icon">🧠</span>
                    <span class="quest-stat-value"
                      >{mainHero.stats?.intelligence || "?"}</span
                    >
                  </div>
                   <div class="quest-stat" title="Charisma">
                    <span class="quest-stat-icon">👑</span>
                    <span class="quest-stat-value"
                      >{mainHero.stats?.charisma || "?"}</span
                    >
                  </div>
                   <div class="quest-stat" title="Constitution">
                    <span class="quest-stat-icon">🛡️</span>
                    <span class="quest-stat-value"
                      >{mainHero.stats?.constitution || "?"}</span
                    >
                  </div>
                 </div>
               </div>
            </div>
          {/if}
        </div>
      {/if}
    {/if}
  </div>
{:else}
  <QuestHistory
    actionHistory={$quest.actionHistory}
    questName={$quest.availableQuestsDetails.find(q => q.id === $quest.currentQuestId)?.name || 'Completed Quest'}
    on:reset={quest.resetQuest}
  />
{/if}

<style>
.available-quests {
    background: rgba(139, 69, 19, 0.1);
    border: 1px solid rgba(212, 175, 55, 0.2);
    padding: 2rem;
    border-radius: 8px;
    margin-bottom: 2rem;
}

.quest-list {
    display: grid;
    gap: 1.5rem;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.quest-card {
    background: rgba(46, 34, 22, 0.7);
    border: 1px solid rgba(212, 175, 55, 0.3);
    padding: 1.5rem;
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.button-group-horizontal {
    display: flex;
    gap: 1rem;
    justify-content: center; /* Or flex-start / flex-end */
    margin-top: auto; /* Push buttons to bottom */
}

.quest-button.small {
    padding: 0.6rem 1.2rem;
    font-size: 1rem;
}
.quest-button.small .text-lg {
    font-size: 1.1rem; /* Adjust icon size */
}

/* Quest Progress Enhancements */
.quest-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(212, 175, 55, 0.2);
}

.round-indicator {
    display: flex;
    align-items: center;
}


  .round-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: #8b4513; /* SaddleBrown */
    margin: 0 6px; /* Reduced margin */
    transition: all 0.3s ease;
    cursor: default; /* Add default cursor */
  }

  .round-dot.active {
    background-color: #d4af37; /* Gold */
    transform: scale(1.3); /* Slightly larger */
     box-shadow: 0 0 8px #d4af37;
  }

  .round-dot.completed {
    background-color: #b8860b; /* DarkGoldenrod */
    opacity: 0.7;
  }

  .quest-status {
    text-align: center;
    padding: 2rem;
    background: rgba(46, 34, 22, 0.5);
    border-radius: 8px;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    margin: 20px auto;
    border: 4px solid rgba(240, 230, 210, 0.3); /* Parchment semi-transparent */
    border-top: 4px solid #d4af37; /* Gold */
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
    font-size: 1.1rem; /* Slightly smaller default size */
    font-family: "Cinzel", serif;
    cursor: pointer;
    transition: all 0.3s;
    display: inline-flex; /* Changed to inline-flex */
    align-items: center;
    gap: 0.75rem; /* Increased gap slightly */
     text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
  }

  .quest-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(212, 175, 55, 0.4); /* Gold shadow */
    background: linear-gradient(135deg, #a0522d 0%, #8b4513 100%); /* Lighter brown on hover */
  }

  .quest-button:disabled {
    background: linear-gradient(135deg, #5a5a5a 0%, #3a3a3a 100%);
    border-color: #777;
    color: #aaa;
    cursor: not-allowed;
    opacity: 0.6;
     text-shadow: none;
  }

.quest-hero-summary {
    background: rgba(42, 26, 18, 0.8); /* Slightly darker background */
    padding: 1rem;
    border-radius: 8px; /* Slightly larger radius */
    margin-top: 2rem; /* More space */
    border: 1px solid rgba(255, 215, 0, 0.2); /* More visible border */
    display: flex;
    align-items: center;
    gap: 1.5rem; /* Increased gap */
    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
}

.quest-hero-image-container {
    width: 100px;
    height: 100px;
    flex-shrink: 0;
    border: 3px solid rgba(255, 215, 0, 0.4); /* Thicker border */
    border-radius: 50%; /* Circular image */
    overflow: hidden;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.quest-hero-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.quest-hero-image-placeholder {
    width: 100%;
    height: 100%;
    background: rgba(30, 15, 10, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem; /* Larger icon */
    color: rgba(255, 215, 0, 0.6);
}

.quest-hero-details {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
}

.quest-hero-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline; /* Align baseline for text */
    margin-bottom: 0.75rem; /* Increased margin */
    padding-bottom: 0.5rem;
    border-bottom: 1px solid rgba(255, 215, 0, 0.15);
}

.quest-hero-name {
    font-size: 1.4rem; /* Larger name */
    color: #ffd700;
    font-family: "MedievalSharp", cursive;
     font-weight: bold;
}

.quest-hero-level {
    font-size: 0.9rem;
    color: #1c140d; /* Dark brown text */
    background: #ffd700; /* Gold background */
    padding: 0.2rem 0.6rem; /* Adjust padding */
    border-radius: 10px; /* Pill shape */
    font-weight: bold;
    font-family: "Cinzel", serif;
}

.quest-hero-stats {
    display: flex;
    flex-wrap: wrap; /* Allow wrapping on smaller screens */
    justify-content: flex-start; /* Start align stats */
    gap: 0.75rem; /* Gap between stats */
    margin-top: 0.5rem;
}

.quest-stat {
    display: flex;
    align-items: center;
    gap: 0.4rem; /* Increased gap */
    padding: 0.3rem 0.6rem; /* Adjust padding */
    background: rgba(30, 15, 10, 0.6); /* Slightly more opaque */
    border-radius: 4px;
    border: 1px solid rgba(255, 215, 0, 0.1);
    min-width: 60px; /* Ensure some minimum width */
    justify-content: center;
}

.quest-stat-icon {
    font-size: 1.1rem; /* Slightly larger icon */
}

.quest-stat-value {
    color: #fff;
    font-size: 1rem;
    font-weight: 600;
     min-width: 1.5ch; /* Ensure space for 2 digits */
     text-align: center;
}


  .button-group {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    margin: 1rem auto; /* Adjusted margin */
    max-width: 400px; /* Wider max width */
  }

  .round-content {
      padding: 1rem 0;
  }

  .round-description {
      min-height: 3em; /* Ensure space for text */
       background: rgba(0,0,0,0.1);
       padding: 1rem;
       border-radius: 4px;
       border-left: 3px solid rgba(212, 175, 55, 0.4);
  }

  .action-buttons {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); /* Responsive grid */
    gap: 1rem;
    margin-top: 1.5rem;
  }

  .action-button {
    background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%); /* Darker base */
    border: 1px solid #888;
    border-radius: 6px;
    padding: 1rem;
    color: #ccc;
    font-family: "Cinzel", serif;
    cursor: pointer;
    transition: all 0.3s;
    text-align: left;
    position: relative;
    overflow: hidden;
    min-height: 80px; /* Ensure consistent height */
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .action-button:hover:not(:disabled) {
    border-color: #d4af37;
    background: linear-gradient(135deg, #3a3a3a 0%, #2a2a2a 100%);
    color: #f0e6d2;
    transform: scale(1.02); /* Slight scale effect */
  }

  .action-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #333;
    border-color: #555;
  }

  .action-label {
    font-size: 1.1rem;
    font-weight: bold;
    display: block;
    margin-bottom: 0.25rem;
  }

  .action-subtext {
    font-size: 0.9rem;
    color: #aaa;
    display: block;
  }
    .action-button:hover:not(:disabled) .action-subtext {
        color: #d4af37; /* Gold subtext on hover */
    }


  .button-spinner {
    position: absolute;
    top: 50%;
    right: 1rem;
    transform: translateY(-50%);
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid #fff;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }


</style>
