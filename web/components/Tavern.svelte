<script>
  import { createEventDispatcher } from "svelte";
  import { onMount } from "svelte";

  export let showTavern;
  export let userHeroes;
  const dispatch = createEventDispatcher();

  function handleClickOutside(event) {
    if (event.target.classList.contains("backdrop")) {
      dispatch("close");
    }
  }

  onMount(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  });
</script>

{#if showTavern}
  <div class="backdrop" />
  <div class="tavern-popup">
    <div class="tavern-header">
      <h3 class="text-xl font-medieval text-coffee-dark">The Tavern</h3>
      <button class="toggle-tavern" on:click={() => dispatch("close")}>×</button
      >
    </div>
    <div class="tavern-content">
      <div class="heroes-list">
        <h4 class="text-xl text-coffee-medium mb-4">Your Heroes</h4>
        {#each userHeroes as hero}
          <div class="hero-card">
            <span class="hero-name">{hero.name}</span>
            <span class="hero-level">Level {hero.level}</span>
          </div>
        {/each}
      </div>
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    z-index: 999;
  }

  .tavern-popup {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #f5e6d3;
    border: 2px solid #8b4513;
    border-radius: 8px;
    padding: 1.5rem;
    width: 90%;
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
    z-index: 1000;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .tavern-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #8b4513;
  }

  .toggle-tavern {
    background: transparent;
    border: none;
    color: #8b4513;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    transition: color 0.3s ease;
  }

  .toggle-tavern:hover {
    color: #5c2d0c;
  }

  .heroes-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .hero-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.5);
    border: 1px solid #8b4513;
    border-radius: 4px;
    transition: transform 0.3s ease;
  }

  .hero-card:hover {
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.7);
  }

  .hero-name {
    color: #8b4513;
    font-size: 1.1rem;
    font-weight: 500;
  }

  .hero-level {
    color: #5c2d0c;
    font-weight: 500;
  }
</style>
