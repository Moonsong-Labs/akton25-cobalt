<script>
  export let isConnected;
  export let handleNavClick;
</script>

<div class="bottom-nav">
  <button
    class="nav-button {!isConnected ? 'disabled' : ''}"
    on:click={() => handleNavClick("log")}
  >
    <span class="text-2xl">📜</span>
    <span>Quest Log</span>
  </button>
  <button
    class="nav-button {!isConnected ? 'disabled' : ''}"
    on:click={() => handleNavClick("tavern")}
  >
    <span class="text-2xl">🏰</span>
    <span>Tavern</span>
  </button>
</div>

<style>
  .bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    gap: 2rem;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(5px);
    border-top: 1px solid var(--dnd-gold);
  }

  .nav-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    color: var(--dnd-gold);
    background: transparent;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .nav-button:hover:not(.disabled) {
    transform: translateY(-2px);
    color: var(--dnd-copper);
  }

  .nav-button.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
