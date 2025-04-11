<script>
  export let mainHero = null;
  import { createEventDispatcher } from "svelte";
  import MintHero from "./MintHero.svelte";
  import { quest } from "../stores/quest";
  const dispatch = createEventDispatcher();

  function openTavern() {
    dispatch("openTavern");
  }
</script>

<div class="hero-selection">
  {#if !mainHero}
    <div class="select-hero-message">
      <h3>Welcome, Brave Adventurer! 🏰</h3>
      <p>Your quest awaits, but first you need a champion!</p>
      <p>
        In the tavern below, you'll find your heroes - some seasoned warriors,
        others still nursing their ale.
      </p>
      <p>
        Choose a hero who's ready for adventure, or enlist a new one if the
        others are still too drunk to stand!
      </p>
      <div class="button-group">
        <button class="tavern-button" on:click={openTavern}>
          <span>Visit the Tavern</span>
          <span class="text-2xl">🏰</span>
        </button>
        <MintHero />
      </div>
    </div>
  {:else if $quest.status === "not_joined"}
    <div class="selected-hero-info">
      <div class="hero-header">
        <h2 class="hero-name">{mainHero.name}</h2>
        <span class="hero-level">Level {mainHero.level}</span>
      </div>

      <p class="hero-status-message">
        Your best hero in town (or at least the one who's had the least ale) is
        has answered the call to arms!
      </p>

      <div class="hero-stats">
        <div class="stat-grid">
          <div class="stat-item" title="Strength">
            <span class="stat-icon">⚔️</span>
            <span class="stat-value">{mainHero.stats.strength}</span>
          </div>
          <div class="stat-item" title="Dexterity">
            <span class="stat-icon">🏹</span>
            <span class="stat-value">{mainHero.stats.dexterity}</span>
          </div>
          <div class="stat-item" title="Will Power">
            <span class="stat-icon">✨</span>
            <span class="stat-value">{mainHero.stats.willPower}</span>
          </div>
          <div class="stat-item" title="Intelligence">
            <span class="stat-icon">🧠</span>
            <span class="stat-value">{mainHero.stats.intelligence}</span>
          </div>
          <div class="stat-item" title="Charisma">
            <span class="stat-icon">👑</span>
            <span class="stat-value">{mainHero.stats.charisma}</span>
          </div>
          <div class="stat-item" title="Constitution">
            <span class="stat-icon">🛡️</span>
            <span class="stat-value">{mainHero.stats.constitution}</span>
          </div>
        </div>
      </div>

      <div class="hero-status">
        <p class="ready-message">You are ready to go on an adventure!</p>
        <div class="cooldown">
          <span class="cooldown-label">Cooldown:</span>
          <span class="cooldown-value">{mainHero.cooldown}</span>
        </div>
      </div>
    </div>
  {:else}
    <div class="quest-in-progress">
      <h3>Quest in Progress! ⚔️</h3>
      <p>Your hero {mainHero.name} is currently on an adventure.</p>
    </div>
  {/if}
</div>

<style>
  .hero-selection {
    padding: 2rem;
    background: radial-gradient(ellipse at center, #2e2216 0%, #1c140d 100%);
    border-radius: 8px;
    border: 2px solid rgba(255, 215, 0, 0.3);
    margin-bottom: 2rem;
  }

  .select-hero-message {
    text-align: center;
    color: #d4af37;
    max-width: 600px;
    margin: 0 auto;
  }

  .select-hero-message h3 {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
    color: #ffd700;
    font-family: "MedievalSharp", cursive;
  }

  .select-hero-message p {
    margin-bottom: 1rem;
    font-size: 1.1rem;
    line-height: 1.6;
  }

  .hero-status-message {
    text-align: center;
    color: #d4af37;
    font-size: 1.1rem;
    margin: 1rem 0;
    font-style: italic;
  }

  .tavern-button {
    background: linear-gradient(135deg, #8b4513 0%, #654321 100%);
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
    margin: 2rem auto 0;
  }

  .tavern-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    background: linear-gradient(135deg, #654321 0%, #8b4513 100%);
  }

  .selected-hero-info {
    color: #d4af37;
  }

  .hero-header {
    text-align: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(255, 215, 0, 0.2);
  }

  .hero-name {
    font-size: 2rem;
    color: #ffd700;
    margin-bottom: 0.5rem;
    display: block;
  }

  .hero-level {
    font-size: 1.2rem;
    color: #000;
    background: #ffd700;
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
  }

  .stat-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .stat-item {
    background: #2a1a12;
    padding: 1rem;
    border-radius: 8px;
    text-align: center;
    border: 1px solid rgba(255, 215, 0, 0.1);
    transition: all 0.3s ease;
  }

  .stat-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }

  .stat-icon {
    display: block;
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }

  .stat-value {
    display: block;
    color: #fff;
    font-size: 1.5rem;
    font-weight: 600;
  }

  .hero-status {
    text-align: center;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 215, 0, 0.2);
  }

  .ready-message {
    font-size: 1.2rem;
    color: #ffd700;
    margin-bottom: 1rem;
  }

  .cooldown {
    color: #d4af37;
  }

  .cooldown-label {
    margin-right: 0.5rem;
  }

  .cooldown-value {
    font-weight: 500;
    color: #fff;
  }

  .button-group {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    margin-top: 2rem;
  }

  .quest-in-progress {
    text-align: center;
    color: #d4af37;
    padding: 2rem;
  }

  .quest-in-progress h3 {
    font-size: 1.8rem;
    margin-bottom: 1rem;
    color: #ffd700;
    font-family: "MedievalSharp", cursive;
  }

  .quest-in-progress p {
    margin-bottom: 1rem;
    font-size: 1.1rem;
    line-height: 1.6;
  }
</style>
