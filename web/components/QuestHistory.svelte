<script>
  import { createEventDispatcher } from 'svelte';
  export let actionHistory;
  export let questName = "Quest"; // Default name

  const dispatch = createEventDispatcher();

  function handleReset() {
    // Dispatch an event that QuestSection can catch, or call store directly
     dispatch('reset'); // Signal to parent (QuestSection)
  }
</script>

<div class="quest-history">
  <h2 class="text-3xl font-medieval text-dnd-gold mb-8">{questName} Summary</h2>

  {#if actionHistory.length > 0}
  <div class="timeline">
    {#each actionHistory as action, i}
      <div class="timeline-item">
        <div class="timeline-marker"></div>
        <div class="timeline-content">
          <h3 class="text-xl text-dnd-gold">Round {action.round}</h3>
          <p class="text-lg mb-2">{action.description}</p>
          <p class="text-dnd-copper">Action taken: {action.action}</p>
        </div>
      </div>
    {/each}
  </div>
  {:else}
   <p class="text-center text-dnd-copper">No actions recorded for this quest attempt.</p>
  {/if}

  <div class="text-center mt-8">
    <button class="quest-button" on:click={handleReset}>
      <span>Begin New Quest</span>
      <span class="text-2xl">🗺️</span> <!-- Changed icon -->
    </button>
  </div>
</div>

<style>
  .quest-history {
    max-width: 800px;
    margin: 2rem auto; /* Added top/bottom margin */
    padding: 2rem;
     background: rgba(46, 34, 22, 0.5); /* Similar background as quest status */
    border-radius: 8px;
     border: 1px solid rgba(212, 175, 55, 0.2);
  }

  .timeline {
    position: relative;
    padding: 2rem 0;
     max-width: 600px; /* Constrain timeline width */
    margin: 0 auto; /* Center timeline */
  }

  .timeline::before {
    content: "";
    position: absolute;
    left: 10px; /* Position line to the left */
    top: 0;
    bottom: 0;
    width: 3px; /* Thicker line */
    background-color: rgba(139, 69, 19, 0.5); /* Softer brown */
     border-radius: 2px;
    /* transform: translateX(-50%); */ /* Removed transform */
  }

  .timeline-item {
    position: relative;
    margin-bottom: 2.5rem; /* Increased spacing */
    padding-left: 40px; /* Space for marker */
    /* display: flex; */ /* Removed flex */
    /* align-items: center; */ /* Removed align */
  }

  .timeline-marker {
    width: 18px; /* Larger marker */
    height: 18px;
    border-radius: 50%;
    background-color: #d4af37;
    border: 3px solid #8b4513; /* Thicker border */
    position: absolute;
    left: 1px; /* Align with the line */
    top: 5px; /* Adjust vertical position */
    /* transform: translateX(-50%); */ /* Removed transform */
     box-shadow: 0 0 5px rgba(212, 175, 55, 0.5);
  }

  .timeline-content {
    /* width: 45%; */ /* Removed fixed width */
    padding: 1.5rem; /* More padding */
    background-color: rgba(139, 69, 19, 0.2); /* Slightly darker */
    border-radius: 8px;
    /* margin-left: 55%; */ /* Removed margin */
     border: 1px solid rgba(212, 175, 55, 0.1);
  }

  /* Removed alternating sides for simplicity */
  /* .timeline-item:nth-child(even) .timeline-content {
      margin-left: 0;
      margin-right: 55%;
      } */

    .quest-button {
        /* Reusing styles from QuestSection for consistency */
        background: linear-gradient(135deg, #8b4513 0%, #654321 100%);
        border: 2px solid #d4af37;
        border-radius: 0.5rem;
        padding: 1rem 2rem;
        color: #f0e6d2;
        font-size: 1.1rem;
        font-family: "Cinzel", serif;
        cursor: pointer;
        transition: all 0.3s;
        display: inline-flex;
        align-items: center;
        gap: 0.75rem;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
    }

    .quest-button:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(212, 175, 55, 0.4);
        background: linear-gradient(135deg, #a0522d 0%, #8b4513 100%);
    }
</style>
