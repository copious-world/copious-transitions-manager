
<script>

import LoginBox from "./lib/LoginBox.svelte"
let g_admin_pass = $state("");
let showlogin = $state(false)

</script>

<div class="top-controls" >
  <input type="checkbox" bind:checked={showlogin} /> auth
  {#if showlogin }
  <LoginBox bind:admin_pass={g_admin_pass} />
  {/if}
</div>

<div>
  <p>
    Check out <a href="https://www.copious.world" target="_blank" rel="noreferrer">Freedom of movement for the IoT generation.
  </p>
  
  <p class="read-the-docs">
    Click on the Copius logo to learn more
  </p>  
</div>


<style>
  .read-the-docs {
    color: #888;
  }

  .top-controls {
    width:100%;
    display: inline-block;
    text-align: left;
    vertical-align: text-top;
  }
</style>
