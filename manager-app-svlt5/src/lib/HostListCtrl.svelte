<script>

let { active_url = $bindable(""),  active_addr = $bindable(""), ...props } = $props();



let host_list = $state([]);

let display_editor = $state(false)


let will_update = $state(false)
let entry_number = $state(0)
let updating_show_status = $state(false)
let updating_url = $state("")
let updating_addr = $state("")
let updating_cloud = $state("")
let updating_ssh_location = $state("")



function populate_current_list_or_zero() {

  let n = host_list.length
  if ( n > 0 ) {
    for ( let i = 0; i < n; i++ ) {
      if ( host_list[i].addr == active_addr ) {
        populate_details(null,host_list[i],i)
        return;
      }
    }
    populate_details(null,host_list[0],0)
  }

}

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
    populate_current_list_or_zero()


  } catch (e) {
    alert(e.message)
  }
}

async function save_host_list(event) {
  //
  if ( props._admin_pass.length === 0 ) {
    alert("no admin pass")
    return
  }
  //
  let host_list_update = [].concat(host_list)
  let params = {
    "admin_pass" : props._admin_pass,
    "host" : (props._manual_url.length ? props._manual_url : undefined),
    "host-list" : host_list_update
  }
  try {
    //
    let result = await window.post_host_list(params)

    if ( !result ) alert("Error")
    //
  } catch (e) {
    alert(e.message)
  }
  
}


function edit_host_list(event) {
  display_editor = !display_editor
}


function populate_details(event,host,n) {
  if ( host !== undefined ) {
    entry_number = n
    updating_url = (host.url !== undefined) ? host.url : ""
    updating_addr = host.addr
    updating_cloud = host.cloud
    updating_ssh_location = (host.ssh_file !== undefined) ? host.ssh_file : ""
    //
    active_url = updating_url
    active_addr = updating_addr
  }
}


function update_details(event,n) {
  let obj = host_list[n]
  obj.url = updating_url
  obj.addr = updating_addr
  obj.cloud = updating_cloud
  obj.ssh_file = updating_ssh_location
  host_list[n] = obj
}

function delete_active_host(event,n) {
  let host = host_list[n]
  let tmp_list = host_list
  tmp_list.splice(n,1)
  host_list = tmp_list
  if ( host.addr == active_addr ) {
    if ( host_list.length > 0 ) {
      if ( (host_list.length == n) ) {
        host = host_list[n-1]
        populate_details(event,host,n-1)
      } else {
        host = host_list[n]
        populate_details(event,host,n)
      }
    } else {
      active_addr = ""
      active_url = ""
    }
  }
}

function clear_details_and_push_empty(event) {
  let host = {
    "url" : "",
    "addr" : "",
    "cloud" : "",
    "ssh_file" : "",
    "info" : "TBD"
  }
  entry_number = host_list.length
  updating_url = (host.url !== undefined) ? host.url : ""
  updating_addr = host.addr
  updating_cloud = host.cloud
  updating_ssh_location = (host.ssh_file !== undefined) ? host.ssh_file : ""
  host_list = host_list.concat([host])
}


populate_current_list_or_zero()

// ---- ---- ---- ---- ---- ---- ---- ----
//

</script>

<div class="nice_message">
  <button onclick={get_host_list}>get host list</button>
  <button onclick={edit_host_list}>{#if display_editor }
    hide edit
  {:else}
    edit hosts
  {/if}</button>
  <button onclick={save_host_list}>save host list</button>


  <div>
    <div class="inner_div">
      <span>Known Hosts:</span>
      <label for="cb-updater">Show Status</label> <input id="cb-updater" type="checkbox" bind:checked={updating_show_status} />

      {#each host_list as host, n }
        <div>
          <button onclick={(event) => populate_details(event,host,n)}>{host.addr}</button> &nbsp;<span>{host.cloud}</span> &nbsp;<span>{host.info}</span><br>
        </div>
      {/each}
    </div>
    {#if display_editor }
    <div class="inner_div">
      <label for="cb-updater">update #{entry_number+1}</label>&nbsp;<input id="cb-updater" type="checkbox" bind:checked={will_update} />
      <div>
        Host name: <input type="url" bind:value={updating_url}><br>
        Host address: <input type="url" bind:value={updating_addr}><br>
        Cloud: <input type="url" bind:value={updating_cloud}><br>
        SSH Location: <input type="url" bind:value={updating_ssh_location}><br>
        {#if will_update }
        <button onclick={(event) => update_details(event,entry_number)} >Update</button>
        {:else}
          <button onclick={(event) => clear_details_and_push_empty(event)} >Add</button>
          <button onclick={(event) => delete_active_host(event,entry_number)} >Remove</button> 
        {/if}
      </div>
    </div>
    {:else}
      {updating_addr} : {updating_url}
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
