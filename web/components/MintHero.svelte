<script>
  import { onMount } from "svelte";
  import { wallet } from "../stores/wallet.ts";

  let isMinting = false;
  let jobId = null;
  let mintedHero = null;
  let error = null;

  async function startMinting() {
    if (!$wallet.isConnected || !$wallet.account) return;

    isMinting = true;
    error = null;
    jobId = null;
    mintedHero = null;

    try {
      // Start the minting process
      const response = await fetch(
        `http://localhost:3001/mint?address=${$wallet.account}`,
        {
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      jobId = data.jobId;

      // Start polling for status
      pollMintStatus();
    } catch (err) {
      error = "Failed to start minting process";
      isMinting = false;
      console.error(err);
    }
  }

  async function pollMintStatus() {
    console.log("jobId", jobId);
    if (!jobId) return;

    try {
      const response = await fetch(
        `http://localhost:3001/mint/status/${jobId}`
      );
      const data = await response.json();

      if (data.status === "completed") {
        mintedHero = data.result;
        isMinting = false;
        // // Check balance after successful mint
        // await wallet.checkBalance();
        // Refresh the tavern's hero list
        await wallet.refreshHeroes();
      } else if (data.status === "pending") {
        // Poll again after 2 seconds
        setTimeout(pollMintStatus, 2000);
      } else {
        error = "Minting failed";
        isMinting = false;
      }
    } catch (err) {
      isMinting = false;
      console.error(err);
    }
  }
</script>

<div class="mint-section">
  <button
    class="mint-button"
    on:click={startMinting}
    disabled={isMinting || !$wallet.isConnected}
  >
    {#if isMinting}
      <span class="button-spinner" />
      Minting...
    {:else}
      Mint Hero
    {/if}
  </button>

  {#if error}
    <p class="error-message">{error}</p>
  {/if}

  {#if mintedHero}
    <div class="minted-hero">
      <h3>Hero Minted!</h3>
      <p>
        You can now see your hero in the tavern and select it for your quest.
      </p>
      <p>Name: {mintedHero.name}</p>
    </div>
  {/if}
</div>

<style>
  .mint-section {
    margin-top: 1rem;
    text-align: center;
  }

  .mint-button {
    background: linear-gradient(135deg, #654321 0%, #8b4513 100%);
    border: 2px solid #d4af37;
    border-radius: 0.5rem;
    padding: 1rem 2rem;
    color: #f0e6d2;
    font-size: 1.25rem;
    font-family: "Cinzel", serif;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0 auto;
  }

  .mint-button:hover:not(:disabled) {
    transform: translateY(-0.125rem);
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.2);
  }

  .mint-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .error-message {
    color: #ef4444;
    margin-top: 0.5rem;
  }

  .minted-hero {
    margin-top: 1rem;
    padding: 1rem;
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 0.5rem;
    border: 1px solid #d4af37;
  }

  .minted-hero h3 {
    font-size: 1.25rem;
    font-family: "MedievalSharp", cursive;
    color: #d4af37;
    margin-bottom: 0.5rem;
  }

  .minted-hero p {
    color: #f0e6d2;
  }
</style>
