<script lang="ts">
  import { quest } from '../../../stores/quest';
  import type { QuestSummary } from '../../../stores/quest'; // Fix import path

  // Log the store state whenever it changes
  $: console.log('Quests Page - Store State:', $quest);

  // No need to explicitly subscribe, use $quest directly in markup

  function handleQuestSelect(questId: number) {
    quest.loadQuestDetails(questId);
    // Navigation will be handled by loadQuestDetails within the store
  }
</script>

<!-- Add a test heading -->
<h1 style="color: lime; font-size: 3rem; text-align: center; margin-top: 5rem;">
  QUESTS PAGE LOADED
</h1>

<div class="quest-list-container">
  <h1 class="page-title">Available Quests</h1>

  {#if $quest.isLoading}
    <div class="loading-message">Loading available quests...</div>
  {:else if $quest.availableQuests.length === 0}
    <div class="no-quests-message">No quests are currently available. Check back later, adventurer!</div>
  {:else}
    <ul class="quest-list">
      {#each $quest.availableQuests as questItem (questItem.id)}
        <li class="quest-item">
          <button class="quest-button" on:click={() => handleQuestSelect(questItem.id)}>
            <div class="quest-content">
              {#if questItem.image}
                <img src={questItem.image} alt="{questItem.name} illustration" class="quest-image" />
              {/if}
              <div class="quest-text">
                <h2 class="quest-name">{questItem.name}</h2>
                <p class="quest-description">{questItem.shortDescription}</p>
              </div>
            </div>
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .quest-list-container {
    max-width: 900px;
    margin: 2rem auto;
    padding: 2rem;
    background: rgba(15, 10, 5, 0.7);
    border: 1px solid rgba(255, 215, 0, 0.2);
    border-radius: 8px;
    font-family: 'Cinzel', serif;
    color: #f0e6d2;
  }

  .page-title {
    text-align: center;
    font-size: 2.5rem;
    color: #ffd700;
    margin-bottom: 2rem;
    font-family: 'MedievalSharp', cursive;
  }

  .loading-message,
  .no-quests-message {
    text-align: center;
    font-size: 1.2rem;
    color: #d4af37;
    padding: 2rem;
  }

  .quest-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 1.5rem;
  }

  .quest-item {
    /* No specific styles needed on li if button fills it */
  }

  .quest-button {
    display: block;
    width: 100%;
    background: linear-gradient(135deg, rgba(46, 34, 22, 0.8) 0%, rgba(28, 20, 13, 0.8) 100%);
    border: 1px solid rgba(255, 215, 0, 0.3);
    border-radius: 6px;
    padding: 1.5rem;
    text-align: left;
    color: inherit;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
  }

  .quest-button:hover {
    transform: translateY(-3px);
    border-color: rgba(255, 215, 0, 0.6);
    box-shadow: 0 5px 10px rgba(0,0,0,0.4);
    background: linear-gradient(135deg, rgba(60, 45, 30, 0.9) 0%, rgba(40, 30, 20, 0.9) 100%);
  }

 .quest-content {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .quest-image {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 4px;
    border: 1px solid rgba(255, 215, 0, 0.1);
    flex-shrink: 0;
  }

  .quest-text {
    flex-grow: 1;
  }

  .quest-name {
    font-size: 1.5rem;
    color: #ffd700;
    margin: 0 0 0.5rem 0;
  }

  .quest-description {
    font-size: 1rem;
    color: #d1c0a8;
    margin: 0;
    line-height: 1.4;
  }
</style> 