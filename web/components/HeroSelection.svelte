<script>
  export let mainHero = null;
  import { createEventDispatcher } from "svelte";
  import { quest } from "../stores/quest";
  import MintHero from "./MintHero.svelte";
  const dispatch = createEventDispatcher();

  function openTavern() {
    dispatch("openTavern");
  }

  // Add helper functions for stats
  function getStatIcon(stat) {
    switch (stat) {
      case "strength":
        return "⚔️";
      case "dexterity":
        return "🏹";
      case "willPower":
        return "✨";
      case "intelligence":
        return "🧠";
      case "charisma":
        return "👑";
      case "constitution":
        return "🛡️";
      default:
        return "?";
    }
  }

  function getStatTitle(stat) {
    switch (stat) {
      case "strength":
        return "Strength: The might of arms and physical power";
      case "dexterity":
        return "Dexterity: Agility, reflexes, and balance";
      case "willPower":
        return "Will Power: Mental fortitude and magical resistance";
      case "intelligence":
        return "Intelligence: Reasoning, memory, and arcane knowledge";
      case "charisma":
        return "Charisma: Force of personality and social influence";
      case "constitution":
        return "Constitution: Health, stamina, and vital force";
      default:
        return "Unknown Stat";
    }
  }
  // End helper functions
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
        <MintHero />
      </div>
    </div>
  {:else if $quest.status === "not_joined"}
    <div class="selected-hero-summary">
      <div class="hero-image-frame">
        <div class="hero-image-container">
          {#if mainHero.imagePath}
            <img
              src={mainHero.imagePath}
              alt={mainHero.name}
              class="hero-image"
              onerror="this.onerror=null; this.src='https://placehold.co/150x150/2e2216/ffd700?text=Hero';"
            />
          {:else}
            <div class="hero-image-placeholder">
              <span>⚔️</span>
            </div>
          {/if}
        </div>
      </div>
      <div class="hero-details">
        <h3 class="hero-name">{mainHero.name}</h3>
        <span class="hero-level">Level {mainHero.level}</span>
        <div class="hero-stats-grid">
          {#each Object.entries(mainHero.stats) as [stat, value], i}
            <div class="stat-item" title={getStatTitle(stat)}>
              <span class="stat-icon">{getStatIcon(stat)}</span>
              <span class="stat-value">{value}</span>
            </div>
          {/each}
        </div>
      </div>
    </div>
    <div class="ready-section">
      <p class="ready-message">You are ready to go on an adventure!</p>
      <p class="cooldown-message">Cooldown: {mainHero.cooldown}</p>
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

  .selected-hero-summary {
    display: flex;
    gap: 2rem;
    align-items: center;
    margin-bottom: 1.5rem;
    color: #d4af37;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    border: 1px solid rgba(255, 215, 0, 0.1);
  }

  .hero-details {
    flex-grow: 1;
    text-align: center;
  }

  .hero-name {
    font-size: 2rem;
    color: #ffd700;
    margin-bottom: 0.25rem;
    display: block;
    font-family: "MedievalSharp", cursive;
  }

  .hero-level {
    font-size: 1.1rem;
    color: #d4af37;
    margin-bottom: 1.5rem;
    display: block;
  }

  .hero-stats-grid {
    display: grid;
    grid-template-columns: repeat(
      3,
      minmax(80px, 1fr)
    );
    gap: 0.75rem;
    max-width: 350px;
    margin: 0 auto;
  }

  .stat-item {
    background: #2a1a12;
    padding: 0.75rem;
    border-radius: 6px;
    text-align: center;
    border: 1px solid rgba(255, 215, 0, 0.1);
    transition: all 0.3s ease;
  }

  .stat-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 215, 0, 0.3);
  }

  .stat-icon {
    display: block;
    font-size: 1.3rem;
    margin-bottom: 0.25rem;
  }

  .stat-value {
    display: block;
    color: #fff;
    font-size: 1.3rem;
    font-weight: 600;
  }

  .ready-section {
    text-align: center;
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(255, 215, 0, 0.2);
  }

  .ready-message {
    font-size: 1.4rem;
    color: #ffd700;
    margin-bottom: 0.75rem;
    font-family: "MedievalSharp", cursive;
  }

  .cooldown-message {
    color: #d4af37;
    font-size: 1rem;
  }

  .button-group {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    margin-top: 2rem;
    margin-bottom: 1.5rem;
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

  .hero-image-frame {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .hero-image-container {
    width: 220px;
    height: 220px;
    border: 4px solid #a0522d;
    border-radius: 12px;
    overflow: hidden;
    box-shadow:
      0 0 10px rgba(0, 0, 0, 0.5),
      inset 0 0 8px rgba(255, 215, 0, 0.3);
    background: radial-gradient(ellipse at center, #4a2a1a 0%, #2e1a0f 100%);
    padding: 5px;
  }

  .hero-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
  }

  .hero-image-placeholder {
    width: 100%;
    height: 100%;
    background: rgba(30, 15, 10, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
    color: rgba(255, 215, 0, 0.5);
    border-radius: 8px;
  }
</style>
