<script>

    export let message;
    export let onCancel = () => {};
    export let onOkay = () => {};

    export let admin_pass
    
    export let name = ""
    export let run_on_start = true
    export let attempt_reconnect = false
    export let runner = "node"
    export let args = ""


    let password_view_type = true
    function toggle_password_view(ev) {
        password_view_type = !password_view_type
    }
    
    let new_name = "";
    $: new_name = name
    
    function _onCancel() {
        onCancel();
    }
    
    function _onOkay() {
        if ( admin_pass.length === 0 ) {
            alert("No admin password")
            return
        }
        let dialog_data = {
            "name" : new_name,
            "run_on_start": run_on_start,
            "attempt_reconnect": attempt_reconnect,
            "runner": runner,
            "args": args
        }
        onOkay(dialog_data);
    }
    
	/*
	"test3.js": {
      "name": "test3.js",
      "run_on_start": true,
      "attempt_reconnect": false,
      "runner": "node",
      "args": "test3"
    }
	 */


  </script>
  
  <style>     
      .buttons {
          display: flex;
          justify-content: space-between;
      }
      .eform {
        display: block;
        padding:4px;
        margin: 4px;
        border: solid 1px rgb(233, 231, 231);
      }


  </style>
  
  <h2>{message}</h2>
  <div style="display:inline-block;text-align:left">
    {#if password_view_type }
    <label for="admin-pass">Admin Password</label>&nbsp;<input type="password" id="admin-pass" bind:value={admin_pass} />
    {:else}
    <label for="admin-pass">Admin Password</label>&nbsp;<input type="text" id="admin-pass" bind:value={admin_pass} />
    {/if}
    <button  style="font-size:larger" on:click={toggle_password_view}>&#x1F441;</button>
  </div>  
  <div class="eform">

    <div class="eform">
        <label for="new-name">Name:</label>&nbsp;&nbsp;
        <input id="new-name" type="text"  bind:value={new_name} />
    </div>
    <div class="eform">
        <label for="new-runner">Runner:</label>&nbsp;&nbsp;
        <input id="new-runner" type="text"  bind:value={runner} />
    </div>
    <div class="eform">
        <span for="run_on_start">Run On Start:</span> <input id="run_on_start" type="checkbox" bind:checked={run_on_start} />
        &nbsp;&nbsp;&nbsp;&nbsp;
        <span for="attempt_reconnect">Attempt Reconnect:</span> <input id="attempt_reconnect" type="checkbox" bind:checked={attempt_reconnect} />
    </div>
    <div class="eform">
        <label for="new-args">Parameters:</label>&nbsp;&nbsp;<input id="new-args" type="text" bind:value={args} />
    </div>

  </div>

  <div class="buttons">
      <button on:click={_onCancel}>
          Cancel
      </button>
      <button on:click={_onOkay}>
          Okay
      </button>
  </div>