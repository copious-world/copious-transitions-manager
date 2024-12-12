<script>

let { host_list = $bindable([]), ...props } = $props();

let display_editor = $state(false)


let will_update = $state(false)
let updating_show_status = $state(false)
let updating_url = $state("")
let updating_addr = $state("")
let updating_cloud = $state("")
let updating_ssh_location = $state("")

async function get_host_list(event) {
  if ( props._admin_pass.length === 0 ) {
    alert("no admin pass")
    return
  }

  let params = {
    "admin_pass" : props._admin_pass,
    "host" : (props._manual_url.length ? props._manual_url : undefined)
  }
  try {
    let result = await window.fetch_host_list(params)

    if ( !result ) alert("Error")

    host_list = result

  } catch (e) {
    alert(e.message)
  }
}


function edit_host_list(event) {
  display_editor = !display_editor
}


</script>

<div class="nice_message">
  <button onclick={get_host_list}>get host list</button>
  <button onclick={edit_host_list}>edit host list</button>


  <div>
    <div class="inner_div">
      <span>Known Hosts:</span>
      {#each host_list as host }
        <button>{host.addr}</button> &nbsp;<span>{host.cloud}</span> &nbsp;<span>{host.info}</span><br>
      {/each}
    </div>
    {#if display_editor }
    <div class="inner_div">
      <label for="cb-updater">update</label><input id="cb-updater" type="checkbox" bind:checked={will_update} />
      <div>
        Host name: <input type="url" bind:value={updating_url}><br>
        Host address: <input type="url" bind:value={updating_addr}><br>
        Cloud: <input type="url" bind:value={updating_cloud}><br>
        SSH Location: <input type="url" bind:value={updating_ssh_location}><br>
        <button>Add</button>  <button>Remove</button> 
        <label for="cb-updater">Show Status</label><input id="cb-updater" type="checkbox" bind:checked={updating_show_status} />
      </div>
    </div>
    {/if}
    
  </div>

</div>

<style>

	.inner_div {
    display:inline-block;
		padding-left: 2px;
		border-bottom: 1px lightgray solid;
		min-height: 40px;
    max-height: 160px;
    vertical-align: top;
	}


	.nice_message {
    display:flexbox;
    vertical-align: top;
    height: fit-content;
		width: 100%;
    padding-left: 2px;
    padding-right: 2px;
		font-size: small;
		font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
		color:rgb(54, 81, 99);
		font-weight:600;
		background: -webkit-linear-gradient(to right, white ,rgb(252, 251, 248));
		background: linear-gradient(to right, white, rgb(252, 251, 248) );
	}

  button {
    padding: 4px;
    width: fit-content;
    height: fit-content;
    border-radius: 4%;
  }

  span {
    padding: 3px;
    width: fit-content;
    height: fit-content;
    border: 1px solid blanchedalmond;
    margin-left:4px;
  }

</style>
