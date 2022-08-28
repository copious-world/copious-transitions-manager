<script>
	import { JsonView } from '@zerodevx/svelte-json-view'

    export let conf_dialog_data
    export let message;
    export let onCancel = () => {};
    export let onOkay = () => {};

    export let admin_pass
    
    let password_view_type = true
    function toggle_password_view(ev) {
        password_view_type = !password_view_type
    }
    
    function _onCancel() {
        onCancel();
    }

    function _onOkay() {
        if ( admin_pass.length === 0 ) {
            alert("No admin password")
            return
        }
        onOkay(conf_dialog_data_str);
    }

    // 
    let conf_dialog_data_str = JSON.stringify(conf_dialog_data,null,4)
    //

    let inputEl = false
    let value = ""
    let placeholder = "JSON input ... edit it"

    let inputClasses = "inputClasses"

    let rows = 20
    let cols = 100
    $: conf_dialog_data_str = JSON.stringify(conf_dialog_data,null,4)

    let edit_str = conf_dialog_data_str
    $:  edit_str = conf_dialog_data_str


    function handleInput(ev) {

        try {
            let teststr = edit_str
            let obj = JSON.parse(teststr)
            conf_dialog_data = obj
        } catch (e) {
            return
        }

    }
   
    function handleBlur(ev) {
        try {
            let teststr = edit_str
            let obj = JSON.parse(teststr)
            conf_dialog_data = obj
        } catch (e) {
            return
        }
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

    .inner_div {
		padding-left: 2px;
		padding-top: 4px;
		border-bottom: 1px lightgray solid;
		min-height: 40px;
    }

    .inputClasses {
        width:50%;
        height:300px;
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
<div class="eform" style="vertical-align:top;text-align:left">
    <div style="display:inline-block;vertical-align:top;height:fit-content">
        <div>Output:</div>
        <div style="height:fit-content;border:solid 1px black;padding:8px">
            <JsonView json={conf_dialog_data} />
        </div>    
    </div>
    <div style="display:inline-block">
        <div>Edit JSON Here:</div>
        <div >
            <textarea
                class={inputClasses}
                bind:this={inputEl}
                {placeholder}
                bind:value={edit_str}
                {rows}
                {cols}
                on:input={handleInput}
                on:blur={handleBlur}
            />
        </div>
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