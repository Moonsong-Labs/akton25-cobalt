<script>
  export let actionHistory = [];
  export let currentRound;
  export let showHistory;

  function resetQuest() {
    currentRound = 1;
    actionHistory = [];
    showHistory = false;
  }
</script>

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
    <button class="quest-button" on:click={resetQuest}>
      <span>Begin New Quest</span>
      <span class="text-2xl">🏰</span>
    </button>
  </div>
</div>

<style>
  .history-section {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    background: rgba(0, 0, 0, 0.7);
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .history-timeline {
    position: relative;
    padding-left: 2rem;
  }

  .history-timeline::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background: linear-gradient(to bottom, #d4af37, #b87333);
  }

  .history-entry {
    position: relative;
    margin-bottom: 2rem;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 4px;
  }

  .history-entry::before {
    content: "";
    position: absolute;
    left: -2.5rem;
    top: 1.5rem;
    width: 1rem;
    height: 1rem;
    background: #d4af37;
    border-radius: 50%;
  }

  .history-round {
    font-size: 1.25rem;
    color: #d4af37;
    margin-bottom: 0.5rem;
  }

  .history-description {
    color: #b87333;
    margin-bottom: 0.5rem;
  }

  .history-action {
    color: #fff;
    font-style: italic;
  }
</style>
