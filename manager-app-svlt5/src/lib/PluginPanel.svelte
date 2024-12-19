<script>

let { active_plugin = $bindable(""), ...props } = $props();



let plugin_list = $state([]);
let plugin_map = $state({})

let current_plugin = $state("none")


async function get_plugin_list(event) {
  if ( props._admin_pass.length === 0 ) {
    alert("no admin pass")
    return
  }
  //
  let params = {
    "admin_pass" : props._admin_pass,
    "host" : (props._manual_url.length ? props._manual_url : undefined)
  }
  //
  try {
    let result = await window.fetch_plugin_list(params)

    if ( !result ) alert("Error")

    plugin_list = result
    plugin_list.unshift("overview")

    for ( let plg of plugin_list ) {
      plugin_map[plg] = "<button>click to load</button>"
    }
    current_plugin = "overview"
    plugin_map["overview"] = "this is the overview"
 
    //console.log(host_list)

  } catch (e) {
    alert(e.message)
  }
}

async function  select_plugin(event,plugin,n) {
  current_plugin = plugin
}

get_plugin_list()

// ---- ---- ---- ---- ---- ---- ---- ----
//

</script>

<div class="nice_message">
  <button onclick={get_plugin_list}>update plugins</button>
  <div class="inner_div">
    <span>Plugins:</span>
    {#each plugin_list as plugin, n }
        <button onclick={(event) => select_plugin(event,plugin,n)}>{plugin}</button>
    {/each}
  </div>
  <div>
    <div>
      {current_plugin}
    </div>
    <div class="outer_div">
      {@html plugin_map[current_plugin]}
    </div>
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

	.outer_div {
    display:block;
		padding-left: 2px;
    border-top: solid 1px darkblue;
		border-bottom: 1px lightgray solid;
		min-height: 40px;
    height: calc(100vh - 60px);
    max-height: calc(100vh - 60px);
    width: 100%;
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
