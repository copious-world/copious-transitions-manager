<script>
    export let npm_dialog_data
    export let message;
    export let hasForm = false;
    export let onCancel = () => {};
    export let onOkay = () => {};
    export let npm_action = "install"
    //
    export let admin_pass
    
    let password_view_type = true
    function toggle_password_view(ev) {
        password_view_type = !password_view_type
    }
    

    let new_name = "";
    
    function _onCancel() {
        onCancel();
    }
    
    function _onOkay() {
        if ( admin_pass.length === 0 ) {
            alert("No admin password")
            return
        }
        npm_dialog_data = {
            "name" : "exec",
            "runner": 'npm',
            "run_on_start": false,
            "attempt_reconnect": false,
            "action" : npm_action,
            "args": args
        }
        onOkay(new_name);
    }
    
    let args = ""

    $: npm_dialog_data = {
        "name" : "exec",
        "runner": 'npm',
        "run_on_start": false,
        "attempt_reconnect": false,
        "action" : npm_action,
        "args": args
    }


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

  {#if hasForm}
    <span>Type the name of an npm module you want to {npm_action}</span>
    <div class="eform">
        <label for="new-args">Parameters:</label>&nbsp;&nbsp;<input id="new-args" type="text" bind:value={args} />
    </div>
  {/if}
  </div>

  <div class="buttons">
      <button on:click={_onCancel}>
          Cancel
      </button>
      <button on:click={_onOkay}>
          Okay
      </button>
  </div>