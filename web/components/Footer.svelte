<script>
  export let isConnected;
  export let handleNavClick;
  export let eventLog = [];
  export let showQuestLog = false;

  let isAnimating = false;
  let lastEventCount = 0;
  let hasNewMessages = false;

  $: if (eventLog.length > lastEventCount) {
    isAnimating = true;
    hasNewMessages = true;
    setTimeout(() => isAnimating = false, 1000);
    lastEventCount = eventLog.length;
  }

  $: notificationCount = eventLog.length > 9 ? '9+' : eventLog.length;
  $: notificationColor = hasNewMessages ? '#ff4444' : '#4a90e2';

  function handleLogClick() {
    handleNavClick("log");
    hasNewMessages = false;
  }
</script>

<div class="bottom-nav">
  <button
    class="nav-button {!isConnected ? 'disabled' : ''}"
    on:click={handleLogClick}
  >
    <span class="text-2xl">📜</span>
    <span>Quest Log</span>
    {#if isConnected && eventLog.length > 0}
      <span 
        class="notification-dot {isAnimating ? 'pulse' : ''}" 
        style="background: {notificationColor}; box-shadow: 0 0 8px {notificationColor}80;"
      >
        {notificationCount}
      </span>
    {/if}
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
    position: relative;
  }

  .nav-button:hover:not(.disabled) {
    transform: translateY(-2px);
    color: var(--dnd-copper);
  }

  .nav-button.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .notification-dot {
    position: absolute;
    top: -10px;
    right: -10px;
    color: white;
    border-radius: 50%;
    min-width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    font-weight: bold;
    padding: 0 8px;
    transition: all 0.3s ease;
  }

  .notification-dot.pulse {
    animation: pulse 1s ease-in-out;
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(255, 68, 68, 0.7);
    }
    50% {
      transform: scale(1.3);
      box-shadow: 0 0 0 15px rgba(255, 68, 68, 0);
    }
    100% {
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(255, 68, 68, 0);
    }
  }
</style>
