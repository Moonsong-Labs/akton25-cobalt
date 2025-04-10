<script>
  import { quest } from "../stores/quest";
  export let actionHistory;
  export let currentRound;
  export let showHistory;

  function handleReset() {
    quest.resetQuest();
  }
</script>

<div class="quest-history">
  <h2 class="text-3xl font-medieval text-dnd-gold mb-8">Quest Summary</h2>

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

  <div class="text-center mt-8">
    <button class="quest-button" on:click={handleReset}>
      <span>Begin New Quest</span>
      <span class="text-2xl">🔄</span>
    </button>
  </div>
</div>

<style>
  .quest-history {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }

  .timeline {
    position: relative;
    padding: 2rem 0;
  }

  .timeline::before {
    content: "";
    position: absolute;
    left: 50%;
    top: 0;
    bottom: 0;
    width: 2px;
    background-color: #8b4513;
    transform: translateX(-50%);
  }

  .timeline-item {
    position: relative;
    margin-bottom: 2rem;
    display: flex;
    align-items: center;
  }

  .timeline-marker {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background-color: #d4af37;
    border: 2px solid #8b4513;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }

  .timeline-content {
    width: 45%;
    padding: 1rem;
    background-color: rgba(139, 69, 19, 0.1);
    border-radius: 8px;
    margin-left: 55%;
  }

  .timeline-item:nth-child(even) .timeline-content {
    margin-left: 0;
    margin-right: 55%;
  }
</style>
