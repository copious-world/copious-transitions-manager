
<script>

import LoginBox from "./lib/LoginBox.svelte"
import URLBox from "./lib/URLBox.svelte"
import HostListCtrl from "./lib/HostListCtrl.svelte"
let g_admin_pass = $state("");
let g_manual_url = $state("localhost");

let g_active_url  = $state("");
let g_active_addr = $state("");


let g_panel = $state("host-list");

let g_panel_selections = [
  "host-list",
  "host-stats",
  "host-ops",
  "host-procs",
  "host-edit",
  "host-cmd-line",
  "host-top"
]

let g_panels = {
  "host-list" : "Admin and Target",
  "host-stats" : "Statistic",
  "host-ops" : "Operations",
  "host-procs" : "Procedures",
  "host-edit" : "Editor",
  "host-cmd-line" : "command line",
  "host-top" : "HTOP"
}


</script>

<div class="top-controls " >
  <div class="ui-controls-1 dropdown">
    <div class="admin-hover dropdown">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
        <path class="heroicon-ui" d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"/>
      </svg>      
    </div>
    <div class="dropdown-content" >
      <div class="selected-panel">
        {g_panels[g_panel]}
      </div>
      <ol>
        <li onclick={(ev) => {g_panel = 'host-list'}}>hosts</li>
        <li onclick={(ev) => {g_panel = 'host-stats'}}>statistics</li>
        <li onclick={(ev) => {g_panel = 'host-ops'}}>operations</li>
        <li onclick={(ev) => {g_panel = 'host-procs'}}>processes</li>
        <li onclick={(ev) => {g_panel = 'host-edit'}}>editors</li>
        <li onclick={(ev) => {g_panel = 'host-cmd-line'}}>command line</li>
        <li onclick={(ev) => {g_panel = 'host-top'}}>htop</li>
      </ol>
    </div>
  </div>

  <div class="ui-controls-1 dropdown">
    <div class="admin-hover dropdown">Admin and Target</div>
    <div class="dropdown-content" >
        <LoginBox bind:admin_pass={g_admin_pass} />
        <URLBox bind:manual_url={g_manual_url} />
    </div>
  </div>
  <div>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
      <rect width="30" height="30" x="3" y="5" rx="2" ry="2" fill="rgba(250,235,215,0.4)" />
    </svg>
      {#if g_panel == 'host-list'}
        <span style="margin-bottom:4px;">Running admin from: {g_manual_url}</span>
      {:else}
        {#each g_panel_selections as a_panel }
          {#if (g_panel == a_panel) }
            <span>{g_panels[a_panel]}</span> <span>{g_active_addr}</span> <span>{g_active_url}</span>
          {/if}
        {/each}
      {/if}
    </div>  
</div>


{#if g_panel == "host-list" }
<div>

  <HostListCtrl bind:active_url={g_active_url} bind:active_addr={g_active_addr}  _admin_pass={g_admin_pass} _manual_url={g_manual_url} />

</div>
{:else if (g_panel == "host-stats") }
<div>
  Statistics 
</div>
{:else if (g_panel == "host-ops") }
<div>
  Operations
</div>
{:else if (g_panel == "host-procs") }
<div>
  Running processes
</div>
{:else if (g_panel == "host-edit") }
<div>
  Editor
</div>
{:else if (g_panel == "host-cmd-line") }
<div>
  Command line 
</div>
{:else if (g_panel == "host-top") }
<div>
  Htop 
</div>
{/if}


<style>

  li {
    cursor: pointer;
    font-weight: bold;
  }

  li:hover {
    color: darkolivegreen;
    text-decoration: underline;
    background-color: antiquewhite;
    border-bottom: solid darkgreen 1px;
  }

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
    font-size: 0.88em;
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
    background-color: rgba(176, 166, 143,0.2);;
    box-shadow: 3px 1px rgb(176, 166, 143);
    text-shadow: 1px 2px 0px #12100b;
    color: rgb(240, 208, 126);
  }


  .selected-panel {
    border-bottom: 1px solid rgb(5, 44, 5);
  }
  
</style>
