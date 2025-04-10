<script>
  import { createEventDispatcher } from "svelte";
  import { onMount } from "svelte";

  export let showQuestLog;
  export let eventLog;
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

{#if showQuestLog}
  <div class="backdrop" />
  <div class="quest-log-popup">
    <div class="quest-log-header">
      <h3 class="text-xl font-medieval text-coffee-dark">Quest Log</h3>
      <button class="toggle-log" on:click={() => dispatch("close")}>×</button>
    </div>
    <div class="quest-log-messages">
      {#each eventLog as event}
        <div class="quest-log-message">
          <span class="message-time"
            >{event.timestamp.toLocaleTimeString()}</span
          >
          <span class="message-text">{event.message}</span>
        </div>
      {/each}
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

  .quest-log-popup {
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

  .quest-log-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #8b4513;
  }

  .toggle-log {
    background: transparent;
    border: none;
    color: #8b4513;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    transition: color 0.3s ease;
  }

  .toggle-log:hover {
    color: #5c2d0c;
  }

  .quest-log-messages {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .quest-log-message {
    display: flex;
    gap: 1rem;
    padding: 0.5rem;
    border-bottom: 1px solid rgba(139, 69, 19, 0.2);
    background: rgba(255, 255, 255, 0.5);
    border-radius: 4px;
  }

  .message-time {
    color: #8b4513;
    min-width: 80px;
    font-weight: 500;
  }

  .message-text {
    color: #5c2d0c;
  }
</style>
