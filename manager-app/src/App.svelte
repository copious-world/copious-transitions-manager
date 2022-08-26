<!-- https://eugenkiss.github.io/7guis/tasks#crud -->
<script>
	//	GOAL : manage id within a web browser
	//		 :		allow user interaction, local DB fucntion, etc. to allow uploading, downloading, and removing igid
	//		 :		from the "of-this.word" URL.
	//	SUPPORT ACTION : 		all action is within the browser...
	//
	import Tab, { Label } from '@smui/tab';
	import TabBar from '@smui/tab-bar';
	import { onMount } from 'svelte';

	let active_profile_image = ""; //"/favicon.png" ; // "/brent-fox-jane-18-b.jpg"
	let active_cwid = ""

	let prefix = '';
	let man_prefix = '';
	let i = 0;

	//
	let u_index = 0


	let active_procs = false
	let active_identity = false
	let known_procs = [false]
	let all_proc_data = {}

	let active_proc_name = ""
	let running_color = "green"
	let running_state = "running"

	
	let manifest_selected_entry = false
	let manifest_selected_form = false
	let manifest_contact_form_list = [false]
	//
	let manifest_obj = {}
	let manifest_index = 0
	let man_cwid = ''

	let active = 'Identify';
	let prev_active = active
	let todays_date = (new Date()).toLocaleString()

	// This is just a default... It will be used until the user picks something else 
	// when editing the manifest.
	//
	let individuals = [
		{ "name": 'Hans Solo', "DOB" : "1000", "place_of_origin" : "alpha centauri", "cool_public_info" : "He is a Master Jedi", "business" : false, "public_key" : "testesttesttest", "signer_public_key" : "ha ha ha ha ha ha ha ", "cwid" : "4504385938", "answer_message" : "", "biometric" : "53535" }
	];

	let selected = individuals[0]


	function reinitialize_user_context() {
		// 
	}


	function navigate_to_proc() {
		// 
	}

	/*
      "wrapped_key" : false,
      "encoding" : "uri",
	  "when"  ... whereas"date" is a human readable string...
	*/

	//
	class Contact {
		//
		constructor() {
			this.empty_identity = {
				"name": '',
				"DOB" : "",
				"place_of_origin" : "", 
				"cool_public_info" : "", 
				"business" : false, 
				"public_key" : false,
				"signer_public_key" : false,
				"biometric" : false
			}
			this.data = this.empty_identity
		}
		//
		set(name,DOB,place_of_origin,cool_public_info,business,public_key,signer_public_key,biometric_blob) {
			let user_data = {
				"name": name,
				"DOB" : DOB,
				"place_of_origin" : place_of_origin, 
				"cool_public_info" : cool_public_info, 
				"business" : (business === undefined) ? false : business, 
				"public_key" : public_key,
				"signer_public_key" : signer_public_key,
				"biometric" : biometric_blob
			}
			this.data = user_data
		}

		copy(contact_info) {
			let data = {}
			for ( let ky in this.empty_identity ) {
				data[ky] = contact_info[ky]
			}
			this.data = data
		}

		match(contact_info) {
			let f_match = true
			f_match = f_match && ( this.data.name === contact_info.name )
			f_match = f_match && ( this.data.DOB === contact_info.DOB )
			f_match = f_match && ( this.data.place_of_origin === contact_info.place_of_origin )
			f_match = f_match && ( this.data.cool_public_info === contact_info.cool_public_info )
			f_match = f_match && ( this.data.business === contact_info.business )
			return f_match
		}
		
		extend_contact(field,value) {
			this.data[field] = value;
		}

		get_field(field) {
			return this.data[field]
		}

		identity() {
			let id_obj = Object.assign(this.empty_identity,this.data)
			return id_obj
		}

		clear_identity() {
			let id_obj = {
				"name": this.data.name,
				"DOB" : this.data.DOB,
				"place_of_origin" : this.data.place_of_origin, 
				"cool_public_info" : this.data.cool_public_info, 
				"business" : this.data.business, 
			}
			return id_obj
		}

	}

	let empty_identity = new Contact()

	//


	// ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----

	$: filteredIndviduals = prefix
		? individuals.filter(individual => {
			const name = `${individual.name}`;
			return name.toLowerCase().startsWith(prefix.toLowerCase());
		})
		: individuals;

	$: selected = (i >= 0) ? filteredIndviduals[i] : empty_identity.identity()

	$: reset_inputs(selected)

	//
	let active_proc_data = {}
	//
	$: active_procs = known_procs[u_index]
	$: {
		if ( active_procs ) {
			active_proc_name = active_procs.proc_name
			window.set_user_title(active_procs.proc_name)
			active_proc_data = JSON.stringify(active_procs,null,2)
			if ( !(active_procs.running) ) {
				running_color = "darkred"
				running_state = "stopped"
			} else {
				running_color = "green"
				running_state = "running"
			}
		}
	}

	let current_index = -1


	$: {
		if ( (active_procs !== undefined) && active_procs ) {
		}
	}

	$: {
		if ( current_index !== u_index ) {
			current_index = u_index
			reinitialize_user_context()
		}
	}

	$: filtered_manifest_contact_form_list = man_prefix
		? manifest_contact_form_list.filter(man_contact => {
			const name = `${man_contact.name}`;
			return name.toLowerCase().startsWith(man_prefix.toLowerCase());
		})
		: manifest_contact_form_list;

	$: {
		manifest_selected_entry = filtered_manifest_contact_form_list[manifest_index]
		if ( (manifest_selected_entry !== undefined) && manifest_selected_entry ) {
			manifest_selected_form = manifest_selected_entry.html
			man_title = manifest_selected_entry.info
			man_max_preference = manifest_obj.max_preference
			man_preference = manifest_selected_entry.preference
			man_cwid = manifest_selected_entry.cwid

			man_contact_is_default = ( man_cwid === manifest_obj.default_contact_form)
		}
	}
						

	$: {
		if ( prev_active !== active ) {
			if ( active == "Introductions" ) {
			} else if ( active == "Messages" ) {
			}
		}
		prev_active = active
	}
	// ---- ---- ---- ---- ---- ---- ---- ---- ---- ----
 
	let creation_to_do = false
	$: {
		creation_to_do = ( (u_index === false) || (active_procs && (active_procs.biometric === undefined)) )
		if ( (typeof active_cwid === "string") && (active_cwid.length === 0) ) {
			creation_to_do = true
		}
	}

	let window_scale = { "w" : 0.4, "h" : 0.8 }
	let edit_popup_scale = { "w" : 0.45, "h" : 0.3}

	let all_window_scales = []
	all_window_scales.push(window_scale)
	all_window_scales.push(window_scale)
	all_window_scales.push(edit_popup_scale)


	function popup_size() {
		let smallest_w = 200   // smallest and bigget willing to accomodate
		let biggest_w = 3000

		let smallest_h = 600
		let biggest_h = 1000

		// bounded window width
		let w = Math.max(smallest_w,window.innerWidth)
		w = Math.min(biggest_w,w)

		// bounded window height
		let h = Math.max(smallest_h,window.innerHeight)
		h = Math.min(biggest_h,h)

		let p_range
		let P
		//	percentage h range 
		let h_p_max = 0.96
		let h_p_min = 0.75
		p_range = h_p_max - h_p_min
		P = (biggest_h - h)/(biggest_h - smallest_h)
		//console.log("P h: " + P)
		let h_scale = P*(p_range) + h_p_min

		//	percentage w range 
		let w_p_max = 0.96
		let w_p_min = 0.20
		p_range = w_p_max - w_p_min
		P = (biggest_w - w)/(biggest_w - smallest_w)
		//console.log("P w: " + P)
		let w_scale = P*(p_range) + w_p_min

		// Setting the current height & width 
		// to the elements 

		return { "w" : w_scale, "h" : h_scale }
	}

	//
	window_scale = popup_size()
	all_window_scales[0] = window_scale
	all_window_scales[1] = window_scale

	//
	onMount(async () => {
		//
		window.addEventListener("resize", (e) => {
			//
			let scale = popup_size()
			//
			window_scale.h = scale.h; 
			window_scale.w = scale.w;
			all_window_scales[0] = window_scale
			all_window_scales[1] = window_scale
			//
		})

		window._expose_to_page = (data) => {
			known_procs = data[0]
			all_proc_data = data[1]
		}

		await startup()
			// initialize
		await get_active_procs()  // updates login page and initializes the view of this user.
	})


// PROFILE  PROFILE  PROFILE  PROFILE  PROFILE  PROFILE  PROFILE 
// PROFILE  PROFILE  PROFILE  PROFILE  PROFILE  PROFILE  PROFILE 


	async function get_active_procs() {
		try {
			let [f_procs,f_data] = await fetch_procs_from_server()
			known_procs = f_procs
			all_proc_data = f_data
		} catch (e) {}
	}




// MESSAGES MESSAGES MESSAGES MESSAGES MESSAGES MESSAGES MESSAGES MESSAGES MESSAGES MESSAGES
// MESSAGES MESSAGES MESSAGES MESSAGES MESSAGES MESSAGES MESSAGES MESSAGES MESSAGES MESSAGES

	// ---- ---- ---- ---- ---- ---- ---- ---- ---- ----
	//

	function reset_inputs(individual) {
	}

	async function restart_proc() {
		let pname = active_proc_name
		let params = {
			"admin_pass" : "test this" ,
			"op" : {
				"name" : "restart-proc",
				"param" : {
					"proc_name" : pname
				}
			}
		}
		try {
			let result = await post_proc_command(params)
			if ( !result ) alert("Error")
		} catch (e) {
			alert(e.message)
		}
	}

	async function run_proc() {
		let pname = active_proc_name
		let params = {
			"admin_pass" : "test this" ,
			"op" : {
				"name" : "run-proc",
				"param" : {
					"proc_name" : pname,
					"if_running" : false
				}
			}
		}
		try {
			let result = await post_proc_command(params)
			if ( !result ) alert("Error")
		} catch (e) {
			alert(e.message)
		}
	}

	async function stop_proc() {
		let pname = active_proc_name
		let params = {
			"admin_pass" : "test this" ,
			"op" : {
				"name" : "stop-proc",
				"param" : {
					"proc_name" : pname
				}
			}
		}
		try {
			let result = await post_proc_command(params)
			if ( !result ) alert("Error")
		} catch (e) {
			alert(e.message)
		}
	}


	async function stopall() {
		let params = {
			"admin_pass" : "test this" ,
			"op" : {
				"name" : "stop-all"
			}
		}
		try {
			let result = await post_proc_command(params)
			if ( !result ) alert("Error")
		} catch (e) {
			alert(e.message)
		}
	}

</script>

<style>
	* {
		font-family: inherit;
		font-size: inherit;
	}

	.splash-if-you-will {
		font-size: 140%;
		text-align: center;
		line-height: 180%;
		font-weight: 700;
		color:rgb(81, 107, 131);
		font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
	}

	.splash-if-you-will span {
		color:rgb(27, 78, 31);
		font-weight: 900;
		font-size: 140%;
		background-color: rgb(255, 254, 238);
		padding: 12px;
		border-radius: 25px;
		font-family: 'Times New Roman', Times, serif;
	}


	.front-page-explain {
		padding: 8px;
		margin-top: 30px;
		color: orangered;
		font-size: 85%;
		font-weight: 500;
		border: solid 1px rgb(45, 99, 45);
		font-family:Georgia, 'Times New Roman', Times, serif;
	}

	blockquote {
		font: 14px/22px normal helvetica, sans-serif;
		margin-top: 10px;
		margin-bottom: 10px;
		margin-left: 50px;
		padding-left: 15px;
		border-left: 3px solid rgb(221, 219, 219);
  	}


	input {
		display: block;
		margin: 0 0 0.5em 0;
	}

	select {
		margin: 0 1em 1em 0;
		width: 14em;
	}

	option {
		cursor: pointer;
	}

	.buttons {
		clear: both;
	}

	.buttons button:disabled {
		color:slategrey;
		border-bottom-color: rgb(233, 237, 240);
		cursor:not-allowed;
	}

	.buttons button {
		background-color:rgb(255, 249, 240);
		font-size:small;
		border-bottom-color: rgb(236, 250, 226);
		border-radius: 6px;
		font-weight: 580;
		font-style: oblique;
	}

	.buttons button:disabled:hover {
		background-color:inherit;
		font-size:small;
		border-bottom-color: rgb(228, 240, 247);
		border-radius: 6px;
		font-weight: 580;
		font-style: oblique;
		cursor:not-allowed;
	}


	.header-button {
		max-width:min-content;
		border-radius: 6px;
		padding: 1px;
		background-color:rgb(248, 250, 248);
	}

	.header-button:hover {
		background-color:rgb(51, 65, 28);
		color:yellow;
	}

	.classy-small {
		background-color:inherit;
		font-size:small;
		border-bottom-color: chartreuse;
		border-radius: 6px;
		font-weight: 580;
		font-style: oblique;
	}


	.long_button {
		width:40%;
	}

	.long_button:disabled {
		color:beige;
	}

	.long_button:disabled:hover{
		color:beige;
		background-color:blanchedalmond;
		cursor:not-allowed;
	}

	.button-header {
		color:rgb(104, 51, 14);
	}

	.button-header:hover {
		color:rgb(15, 92, 34);
		background-color: rgba(242, 242, 210, 0.3);
	}


	.inner_div {
		padding-left: 2px;
		padding-top: 4px;
		border-bottom: 1px lightgray solid;
		min-height: 40px;
	}

	.inner_div label {
		font-size:smaller;
	}


	.top-of-contact {
		margin-bottom: 4px;
		background-color: rgb(252, 249, 240);
		border: cornsilk solid 1px;
		text-align:right;
	}

	.nice_message {
		width: 85%;
		font-size: small;
		font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
		color:rgb(54, 81, 99);
		font-weight:600;
		background: -webkit-linear-gradient(to right, white ,rgb(252, 251, 248));
		background: linear-gradient(to right, white, rgb(252, 251, 248) );
	}

	.add-profile-div {
		margin-top:8px;
		border: 1px solid rgb(165, 161, 190);
		padding: 2px;
		background: -webkit-linear-gradient(to right, rgb(252, 251, 240) ,rgb(249, 252, 248));
		background: linear-gradient(to right, rgb(252, 251, 240), rgb(249, 252, 248) );
	}

	.top_instructions {
		padding: 2px;
		color:rgb(66, 33, 13);
		border-bottom: sienna 1px solid;
		font: 0.9em sans-serif;
		font-weight: 600;
		font-style: oblique;
	}


	.team_message {
		background-color: rgb(254, 252, 245);
		border: solid 1px darkblue;
		padding:4px;
		color:rgb(12, 12, 100);
		font-size: 110%;
		height: calc(100vh - 280px);
		overflow: scroll;
	}

	.team_message blockquote {
		width: 85%;
		line-height: 200%;
	}

	.items {
		display: flex;
		flex-wrap: wrap;
		margin-left: 2px;
		margin-top: -10px;
	}

	.items .item {
		flex: 1 0 300px;
		box-sizing: border-box;
		background: -webkit-linear-gradient(to right, rgba(242, 242, 210, 0.3), white);
		background: linear-gradient(to right, rgba(242, 242, 210, 0.3), white );
		color: #171e42;
		padding: 10px;
		margin-left: 2px;
		margin-top: 0px;
	}

	.items {
		padding-left: 5px;
		padding-bottom: 4px;
		padding-right: 12px;
		font-size: 110%;
		font-family: sans-serif;
	}
	
	td, th {
		border : 1px solid rgb(47, 79, 49);
		border-right: none;
		padding : 2px;
		margin : 0px;
	}

	th {
		color :rgb(47, 79, 49);
		font-weight: bolder;
		background-color: seashell;
	}

	table {
		border-right: solid 1px darkslategray;
	}

	.subject {
		font-weight: bold;
	}

	.sender {
		background-color: rgb(255, 255, 255);
		font-weight: 600;
		color:rgb(27, 78, 31);
		padding-left: 4px;
	}


	.tableFixHead {
		overflow-y: auto;
		height: calc(100vh - 200px);
	}
	.tableFixHead thead th {
		position: sticky;
		top: 0;
	}
	table {
		border-collapse: collapse;
		width: 100%;
	}
	th, td {
		padding: 8px 16px;
		border: 1px solid #ccc;
	}
	th {
		background: #eee;
	}

	tr {
		cursor: pointer;
	}

	.tableFixHead option {
		cursor: pointer;
	}


	.user-options {
		background-color: rgb(252, 252, 249);
	}

	.user-options option {
		cursor: pointer;
	}

	.selected_form_link-display {
		margin-top:4px;
		margin-bottom:4px;
		border: solid 1px rgb(13, 48, 20);
		padding:4px;
		background-color: white;
		height:200px;
		overflow:auto;
	}

	#man_cwid {
		font-size:smaller;
		min-width:100%;
		font-weight:bold;
	}

	.signup-status {
		color: black;
		background-color: rgb(254, 252, 245);
		font-weight: bold;
		border: solid 1px rgb(13, 48, 20);
		padding:4px;
		height: 60px;
		overflow: auto;
	} 
	.good-status {
		color: green;
	}
	.bad-status {
		color: red;
	}

	.contact_form_list {
		margin-top:4px;
		margin-bottom:4px;
		border: solid 1px navy;
		padding:4px;
		color: darkgreen;
		background-color: rgb(253, 249, 242);
		text-align: center;
	}

	.signup-grid-container {
		display: grid;
		grid-column-gap: 2px;
		grid-row-gap: 2px;
		grid-template-columns: 65% auto;
		background-color: rgb(250, 250, 242);
		padding: 4px;
	}

	.signerupper {
		background-color: rgb(252, 251, 248);
		border: solid 1px rgb(0, 0, 117);
		padding:6px;
	}

	.picture-drop {
		width:90px;
		min-height:90px;
		border: 1px solid navy;
		background-color:rgb(225, 230, 236);
		display:inline-block;
		margin: 2px;
		text-align:center;
		vertical-align: middle;
		cursor:pointer;
	}

	.picture-drop:hover {
		border: 2px dotted rgb(180, 8, 31);
		background-color:rgb(151, 197, 114);
	}

	.picture-drop > .capture_image {
		position:absolute; 
		top:0px; 
		left:0px; 
		z-index:100; 
		width: auto; 
		height: inherit; 
		border:none;
		cursor:pointer;
	}

	.contact_controls {
		width: calc(32vw - 96px);
		margin: 2px;
		border: 1px solid navy;
		display:inline-block;
		background-color: white;
	}

	.contact_controls button {
		border-radius: 8px;
	}

	.manifest-grid-container {
		display: grid;
		grid-column-gap: 2px;
		grid-row-gap: 2px;
		grid-template-columns: 40% auto;
		background-color: rgb(250, 250, 242);
		padding: 4px;
	}

	.manifester {
		background-color: rgb(244, 248, 244);
		border: solid 1px darkblue;
		padding:4px;
	}
	
	.active-tab {
		color: rgb(40, 122, 19);
		background-color: rgb(255, 255, 255);
		font-weight: bolder;
	}

	.plain-tab {
		color: rgb(1, 10, 1);
	}

	.manifest-contact-entry-instruct {
		font-weight: 540;
		font-style:oblique;
		padding-right:3px;
		color:tomato;
		background-color: rgba(235, 225, 235, 0.61);
	}

	.man-default-selected {
		color:rgb(56, 156, 81);
		background-color:rgb(231, 243, 231);
		font-weight: bold;
		border: 1x solid rgb(7, 78, 7);
	}
	.man-default-not-selected {
		color:navy;
	}

	.cwid-grabber {
		font-weight:bolder;
		color:navy;
	}

	.cwid-grabber-label {
		font-weight:600;
		color:rgb(50, 148, 50);
		font-style: oblique;
	}

	.instructor {
		padding: 3px;
		margin-bottom: 4px;
	}

</style>

<div>
	<!--
	  Note: tabs must be unique. (They cannot === each other.)
	-->
	<TabBar tabs={['Overview', 'Ops', "Source"]} let:tab bind:active>
	  <!-- Note: the `tab` property is required! -->
	  <Tab {tab}>
		<Label><span class={ (tab === active) ? "active-tab" : "plain-tab"}>{tab}</span></Label>
	  </Tab>
	</TabBar>
  <br>

	{#if (active === 'Overview')}
	<div class="splash-if-you-will" style="height:fit-content" >
		<div class="front-page-explain">
			Overview of your processes running on instance :: {todays_date}
		</div>
		<div class="nice_message">
			<div class="inner_div">
				<button>add</button>
				<button>remove</button>
				&tridot;
				<button>exec</button>
				<div style="display:inline-block;text-align:right;width:30%">
					<button on:click={stopall}>shutdown</button>
				</div>
			</div>
			<div class="inner_div">
				<button>install</button>
				<button>remove</button>
			</div>
		</div>
		<div>
			<select bind:value={u_index} size={10} style="text-align:center;" on:click={navigate_to_proc} >
				{#each known_procs as maybe_proc, u_index }
					<option value={u_index} style="color:{maybe_proc.running ? 'green' : 'red' }">{maybe_proc.proc_name}</option>
				{/each}
			</select>
		</div>
	</div>
  	{:else if (active === 'Ops')}
	<div class="nice_message">
		<div>
			<span style="font-size:larger">{active_proc_name}</span>
			<span style="font-size:larger;color:{running_color}">{running_state}</span>
		</div>
		<div class="inner_div">
			<button on:click={run_proc}>run</button>
			<button on:click={stop_proc}>stop</button>
			<button on:click={restart_proc}>restart</button>
			&tridot;
			<button>remove</button>
			<button>config</button>
		</div>
		<code>
			{active_proc_data}
		</code>
	</div>
	{:else if (active === 'Source')}
	<div>
		Look at particular files here
	</div>
	{/if}

</div>
