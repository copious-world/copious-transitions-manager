<script>
    export let npm_dialog_data
    export let message;
    export let hasForm = false;
    export let onCancel = () => {};
    export let onOkay = () => {};
    export let npm_action = "install"
    
    let new_name = "";
    
    function _onCancel() {
        onCancel();
    }
    
    function _onOkay() {
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