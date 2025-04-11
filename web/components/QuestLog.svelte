<script>
  import { createEventDispatcher } from "svelte";
  import { onMount } from "svelte";

  export let showQuestLog;
  export let eventLog;
  const dispatch = createEventDispatcher();

  function formatMessage(message) {
    if (message.includes("Failed to join quest on-chain:")) {
      const parts = message.split(": ");
      return {
        main: parts[0] + ":",
        details: parts.slice(1).join(": "),
      };
    }
    return {
      main: message,
      details: null,
    };
  }

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
      <h3 class="text-xl font-medieval text-dnd-gold">Quest Log</h3>
      <button class="toggle-log" on:click={() => dispatch("close")}>×</button>
    </div>
    <div class="quest-log-messages">
      {#each eventLog as event}
        <div class="quest-log-message">
          <span class="message-time"
            >{event.timestamp.toLocaleTimeString()}</span
          >
          <div class="message-content">
            {#if formatMessage(event.message).details}
              <div class="message-main">
                {formatMessage(event.message).main}
              </div>
              <div class="message-details">
                {formatMessage(event.message).details}
              </div>
            {:else}
              <div class="message-text">{event.message}</div>
            {/if}
          </div>
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
    background: radial-gradient(ellipse at center, #2e2216 0%, #1c140d 100%);
    border: 2px solid rgba(255, 215, 0, 0.3);
    border-radius: 8px;
    padding: 1.5rem;
    width: 95%;
    max-width: 1200px;
    height: 67.5vh;
    max-height: 67.5vh;
    overflow-y: auto;
    z-index: 1000;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
    font-family: "Cinzel", serif;
  }

  .quest-log-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid rgba(255, 215, 0, 0.2);
  }

  .toggle-log {
    background: transparent;
    border: none;
    color: #ffd700;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    transition: color 0.3s ease;
  }

  .toggle-log:hover {
    color: #fff;
  }

  .quest-log-messages {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 0.5rem;
  }

  .quest-log-message {
    display: flex;
    gap: 1rem;
    padding: 0.75rem;
    background: rgba(42, 26, 18, 0.8);
    border-radius: 6px;
    border: 1px solid rgba(255, 215, 0, 0.1);
    transition: all 0.3s ease;
  }

  .quest-log-message:hover {
    transform: translateX(5px);
    background: rgba(42, 26, 18, 0.9);
    border-color: rgba(255, 215, 0, 0.2);
  }

  .message-time {
    color: #d4af37;
    min-width: 80px;
    font-weight: 500;
    font-size: 0.9rem;
  }

  .message-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .message-main {
    color: #ff4444;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .message-details {
    color: rgba(240, 230, 210, 0.7);
    font-size: 0.9rem;
    font-family: monospace;
    white-space: pre-wrap;
    word-break: break-all;
  }

  .message-text {
    color: #f0e6d2;
    font-size: 1rem;
    line-height: 1.4;
  }
</style>
