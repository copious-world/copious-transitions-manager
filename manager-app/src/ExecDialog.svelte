<script>
    export let exec_dialog_data
    export let message;
    export let hasForm = false;
    export let onCancel = () => {};
    export let onOkay = () => {};
    
    let new_name = "";
    
    function _onCancel() {
        onCancel();
    }
    
    function _onOkay() {
        onOkay(new_name);
    }
    

    let runner = "node"
    let args = ""

    $: exec_dialog_data = {
        "name" : "exec",
        "runner": runner,
        "run_on_start": false,
        "attempt_reconnect": false,
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

      .span {
        font-weight: bold;
        margin:3px;
      }

  </style>
  
  <h2>{message}</h2>
  <div class="eform">

  {#if hasForm}
    <div class="eform">
        <label for="new-runner">Runner:</label>&nbsp;&nbsp;
        <input id="new-runner" type="text"  bind:value={runner} />
    </div>
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