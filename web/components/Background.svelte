<script>
  import BeerMug from "./background-elements/BeerMug.svelte";
  import Crystal from "./background-elements/Crystal.svelte";
  import Dragon from "./background-elements/Dragon.svelte";
  import Ghost from "./background-elements/Ghost.svelte";
  import Portal from "./background-elements/Portal.svelte";
  import SwordFight from "./background-elements/SwordFight.svelte";
  import Treasure from "./background-elements/Treasure.svelte";
  import Wizard from "./background-elements/Wizard.svelte";
</script>

<div class="background-container">
  <Dragon />
  <SwordFight />
  <BeerMug />
  <Crystal />
  <Portal />
  <Wizard />
  <Treasure />
  <Ghost />
</div>

<style>
  .background-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    overflow: hidden;
  }
</style>
