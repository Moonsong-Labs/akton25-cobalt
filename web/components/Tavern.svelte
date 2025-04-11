<script>
  import { createEventDispatcher } from "svelte";
  import { onMount } from "svelte";

  export let showTavern;
  export let userHeroes;
  const dispatch = createEventDispatcher();

  let selectedHero = userHeroes[0];

  function handleClickOutside(event) {
    if (event.target.classList.contains("backdrop")) {
      dispatch("close");
    }
  }

  function selectHero(hero) {
    selectedHero = hero;
  }

  onMount(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  });
</script>

<svelte:head>
  <link
    href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap"
    rel="stylesheet"
  />
</svelte:head>

{#if showTavern}
  <div class="backdrop" />
  <div class="tavern-popup">
    <div class="tavern-header">
      <h3 class="text-xl font-medieval text-coffee-dark">The Tavern</h3>
      <button class="toggle-tavern" on:click={() => dispatch("close")}>×</button
      >
    </div>
    <div class="tavern-content">
      {#if userHeroes.length === 0}
        <div class="empty-state">
          <h4>No Heroes Found</h4>
          <p>Your heroes will appear here once you have some.</p>
        </div>
      {:else}
        <div class="heroes-container">
          <div class="heroes-list">
            <h4 class="text-xl text-coffee-medium mb-4">Your Heroes</h4>
            {#each userHeroes as hero}
              <div
                class="hero-list-item"
                class:selected={selectedHero === hero}
                on:click={() => selectHero(hero)}
              >
                <span class="level-badge">L. {hero.level}</span>
                <span class="hero-name">{hero.name}</span>
              </div>
            {/each}
          </div>

          <div class="hero-profile">
            {#if selectedHero}
              <div class="profile-header">
                <h2 class="profile-name">{selectedHero.name}</h2>
                <span class="profile-level">Level {selectedHero.level}</span>
              </div>

              <div class="profile-stats">
                <div class="stat-section">
                  <h3>Attributes</h3>
                  <div class="stat-grid">
                    <div
                      class="stat-item"
                      title="Strength: The might of arms and the power of will"
                    >
                      <span class="stat-icon">⚔️</span>
                      <span class="stat-label">Strength</span>
                      <span class="stat-value"
                        >{selectedHero.stats.strength}</span
                      >
                    </div>
                    <div
                      class="stat-item"
                      title="Dexterity: The nimbleness of body and spirit"
                    >
                      <span class="stat-icon">🏹</span>
                      <span class="stat-label">Dexterity</span>
                      <span class="stat-value"
                        >{selectedHero.stats.dexterity}</span
                      >
                    </div>
                    <div
                      class="stat-item"
                      title="Will Power: The strength of mind and determination"
                    >
                      <span class="stat-icon">✨</span>
                      <span class="stat-label">Will Power</span>
                      <span class="stat-value"
                        >{selectedHero.stats.willPower}</span
                      >
                    </div>
                    <div
                      class="stat-item"
                      title="Intelligence: The sharpness of wit and knowledge"
                    >
                      <span class="stat-icon">🧠</span>
                      <span class="stat-label">Intelligence</span>
                      <span class="stat-value"
                        >{selectedHero.stats.intelligence}</span
                      >
                    </div>
                    <div
                      class="stat-item"
                      title="Charisma: The power of presence and persuasion"
                    >
                      <span class="stat-icon">👑</span>
                      <span class="stat-label">Charisma</span>
                      <span class="stat-value"
                        >{selectedHero.stats.charisma}</span
                      >
                    </div>
                    <div
                      class="stat-item"
                      title="Constitution: The endurance of body and resilience"
                    >
                      <span class="stat-icon">🛡️</span>
                      <span class="stat-label">Constitution</span>
                      <span class="stat-value"
                        >{selectedHero.stats.constitution}</span
                      >
                    </div>
                  </div>
                </div>

                <div class="profile-footer">
                  <div class="cooldown">
                    <span class="cooldown-label">Cooldown:</span>
                    <span class="cooldown-value">{selectedHero.cooldown}</span>
                  </div>
                  <a
                    href={selectedHero.metadataUrl}
                    target="_blank"
                    class="metadata-link"
                  >
                    View Metadata
                  </a>
                </div>
              </div>
            {/if}
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  @keyframes shimmer {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  @keyframes glow {
    0% {
      box-shadow: 0 0 5px rgba(255, 215, 0, 0.1);
    }
    50% {
      box-shadow: 0 0 20px rgba(255, 215, 0, 0.2);
    }
    100% {
      box-shadow: 0 0 5px rgba(255, 215, 0, 0.1);
    }
  }

  @keyframes sparkle {
    0% {
      opacity: 0;
      transform: scale(0.5);
    }
    50% {
      opacity: 1;
      transform: scale(1);
    }
    100% {
      opacity: 0;
      transform: scale(0.5);
    }
  }

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

  .tavern-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid rgba(255, 215, 0, 0.2);
  }

  .toggle-tavern {
    background: transparent;
    border: none;
    color: #ffd700;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    transition: color 0.3s ease;
  }

  .toggle-tavern:hover {
    color: #fff;
  }

  .empty-state {
    text-align: center;
    padding: 2rem;
    color: #d4af37;
  }

  .empty-state h4 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  .heroes-container {
    display: flex;
    gap: 2rem;
    min-height: 525px;
  }

  .heroes-list {
    width: 400px;
    flex-shrink: 0;
    border-right: 1px solid rgba(255, 215, 0, 0.1);
    padding-right: 1rem;
  }

  .hero-list-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    margin-bottom: 0.5rem;
    background: transparent;
    border-bottom: 1px solid rgba(255, 215, 0, 0.1);
    border-radius: 0;
    cursor: pointer;
    transition: all 0.3s ease;
    color: #d4af37;
    position: relative;
    overflow: hidden;
    box-shadow: none;
  }

  .hero-list-item:hover {
    background: rgba(255, 215, 0, 0.05);
    transform: translateX(5px);
    box-shadow: none;
  }

  .hero-list-item.selected {
    background: rgba(255, 215, 0, 0.1);
    color: #ffd700;
    border: none;
    border-bottom: 1px solid #ffd700;
    box-shadow: none;
  }

  .hero-list-item.selected::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      45deg,
      transparent,
      rgba(255, 215, 0, 0.05),
      transparent
    );
    animation: shimmer 2s infinite;
  }

  .hero-profile {
    flex: 1;
    min-width: 0;
    padding: 1.5rem;
    background: #2a1a12;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    position: relative;
  }

  .profile-header {
    text-align: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(255, 215, 0, 0.1);
  }

  .profile-name {
    font-size: 2rem;
    color: #ffd700;
    margin-bottom: 0.5rem;
    position: relative;
  }

  .profile-name::first-letter {
    font-size: 2.5rem;
    color: #ffd700;
  }

  .profile-level {
    font-size: 1.2rem;
    color: #000;
    background: #ffd700;
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
    position: relative;
  }

  .profile-level::after {
    content: "✨";
    position: absolute;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    animation: sparkle 2s infinite;
  }

  .profile-stats {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .stat-section {
    background: #1e0f0a;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    position: relative;
  }

  .stat-section h3 {
    color: #d4af37;
    margin-bottom: 1rem;
    font-size: 1.2rem;
    text-align: center;
    position: relative;
  }

  .stat-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  .stat-item {
    background: #2a1a12;
    padding: 1.25rem;
    border-radius: 8px;
    text-align: center;
    border: 1px solid rgba(255, 215, 0, 0.1);
    position: relative;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
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

  .stat-label {
    display: block;
    color: #d4af37;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }

  .stat-value {
    display: block;
    color: #fff;
    font-size: 1.5rem;
    font-weight: 600;
  }

  .profile-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 215, 0, 0.1);
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

  .metadata-link {
    color: #d4af37;
    text-decoration: none;
    padding: 0.5rem 1rem;
    border: 1px solid rgba(255, 215, 0, 0.2);
    border-radius: 4px;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .metadata-link:hover {
    background: #ffd700;
    color: #000;
    box-shadow: 0 4px 8px rgba(255, 215, 0, 0.3);
  }

  .level-badge {
    font-size: 0.9rem;
    color: #000;
    background: #ffd700;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    width: 45px;
    text-align: center;
    display: inline-block;
  }

  .hero-list-item.selected .level-badge {
    background: #ffd700;
    box-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
  }

  .hero-name {
    flex: 1;
    margin-left: 1rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
