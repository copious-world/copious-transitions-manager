
<script>

import LoginBox from "./lib/LoginBox.svelte"
import URLBox from "./lib/URLBox.svelte"
import HostListCtrl from "./lib/HostListCtrl.svelte"
let g_admin_pass = $state("");
let g_manual_url = $state("localhost");

let g_host_list = $state([]);



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

      g_host_list = result

    } catch (e) {
      alert(e.message)
    }

	}

</script>

<div class="top-controls " >
  <div class="ui-controls-1 dropdown">
    <div class="admin-hover dropdown">Admin and Target</div>
    <div class="dropdown-content" >
        <LoginBox bind:admin_pass={g_admin_pass} />
        <URLBox bind:manual_url={g_manual_url} />
    </div>
    </div>
</div>

<button onclick={get_host_list}>get host list</button>
<span>
  Running admin from: {g_manual_url}
</span>
<div>

  <HostListCtrl bind:host_list={g_host_list} />

</div>


<style>

  .dropdown {
    position: relative;
    display: inline-block;
  }

  .dropdown-content {
    display: none;
    position: absolute;
    background-color: #f9f9f9;
    min-width: 200px;
    height:max-content;
    box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
    padding: 12px 16px;
    z-index: 1;
  }

  .dropdown:hover .dropdown-content {
    display: block;
    width: fit-content;
    height: fit-content;
  }

  span {
    margin-left: 3px;
    margin-right: 3px;
    font-weight: bold;
  }

  .ui-controls-1 {
    width: fit-content;
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

  .admin-hover {
    box-shadow: 2px 3px rgb(248, 230, 185);
    font-weight: bolder;
    box-shadow: gainsboro;
    text-decoration-line: underline;
    cursor: pointer;
  }

  .admin-hover:hover {
    cursor: pointer;
    box-shadow: 3px 1px rgb(176, 166, 143);
    text-shadow: 1px 2px 0px #12100b;
    color: rgb(240, 208, 126);
  }
  
</style>
