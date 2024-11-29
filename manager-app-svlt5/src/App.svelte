
<script>

import LoginBox from "./lib/LoginBox.svelte"
import URLBox from "./lib/URLBox.svelte"
let g_admin_pass = $state("");
let g_manual_url = $state("");
let showlogin = $state(false);
let showurl_manual = $state(false);

let g_host_list = $state("");



async function get_host_list(evet) {
		if ( g_admin_pass.length === 0 ) {
			alert("no admin pass")
			return
		}

    let params = {
      "admin_pass" : g_admin_pass,
      "host" : (g_manual_url.length ? g_manual_url : undefined)
    }
    try {
      let result = await fetch_host_list(params)

      if ( !result ) alert("Error")

      g_host_list = JSON.stringify(result)

    } catch (e) {
      alert(e.message)
    }

	}

</script>

<div class="top-controls" >
  <div class="ui-controls-1">
    <input type="checkbox" bind:checked={showlogin} /> auth<br>
    <input type="checkbox" bind:checked={showurl_manual} /> url
  </div>
  {#if showlogin }
    <LoginBox bind:admin_pass={g_admin_pass} />
  {/if}
  {#if showurl_manual }
    <URLBox bind:manual_url={g_manual_url} />
  {/if}
</div>

<button onclick={get_host_list}>get host list</button>
<div>
  <p>
    Check out <a href="https://www.copious.world" target="_blank" rel="noreferrer">Freedom of movement for the IoT generation.
  </p>
  
  <p class="read-the-docs">
    Click on the Copius logo to learn more
  </p>

  <p>
    Running admin from: {g_manual_url}
  </p>

  <p>
    {g_host_list}
  </p>

</div>


<style>

  .read-the-docs {
    color: #888;
  }

  .ui-controls-1 {
    width: 70px;
    vertical-align: top;
    display: inline-block;
  }

  .top-controls {
    width:100%;
    height: 60px;
    text-align: left;
    vertical-align: text-top;
    border-bottom: 1px solid darkslateblue;
  }
  
</style>
