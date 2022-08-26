<script>
	import { onMount } from 'svelte';
	import * as ipfs_profiles from './ipfs_profile_proxy.js'
	import * as utils from './utilities.js'

	// selected...  A contact either from the contact list or from the message (and already there)
	export let name;
	export let DOB;
	export let place_of_origin;
	export let cool_public_info;
	export let business;
	export let public_key;			// this may be empty... can add a contact without the key (message should have key)
	export let signer_public_key;
	export let answer_message		// boolean
	export let biometric
	export let cid

	export let reply_to;	// the source message
	export let active_identity

	export let from_contact = false
	export let contact_form_list
	export let cc_list = []
	let selected_contact_cid = 'default'

	//
	let receiver_pub_key = false
	let special_contact_form_cid = false

	let show_key = false
	let introduction = false
	let message_was_sent = false


	let cc_index = cc_list.length > 0 ? 0 : -1
	let cc_cid = -1
	let cc_read_list = []
	let cc_select_list = []

	let attachments = []

	let clear_cid = false

	let message_type = "introduction"
	let receiver_user_info = {
			"name" : name,
			"DOB" : DOB,
			"place_of_origin" : place_of_origin,
			"cool_public_info" : cool_public_info,
			"business" : business,
			"public_key" : public_key,
			"signer_public_key" : signer_public_key,
			"biometric" : biometric
		}
		
	let use_previous = answer_message

	$: message_type = introduction ? "introduction" : "message"

	let cform_index = 0
	//
	let reply_with = "default"
	//
	let augmented_contact_form_list = [{ "cid" : "default", "info" : "default "}]
	$: augmented_contact_form_list = [{ "cid" : "default", "info" : "default "}].concat(contact_form_list)

	$: {
		if ( cform_index >= 0 ) {
			selected_contact_cid = augmented_contact_form_list[cform_index].cid
			reply_with = augmented_contact_form_list[cform_index].info
		}
	}

	$: {
		if ( cc_list.length === 0 ) {
			cc_select_list = [{ "name" : "no cc", }]
		} else {
			cc_select_list = [{ "name" : "no cc", }]
			cc_select_list = cc_select_list.concat(cc_list)
		}
	}

	$: {
		if ( cc_index > 0 ) {
			let cc_item = cc_list[cc_index-1]
			if ( cc_item ) {
				cc_cid = cc_item.cid
				cc_read_list.push(cc_cid)
				common_contact_vars["{{id-cc-"].set_el_html(cc_read_list.join(','))
			} else {
				cc_read_list = []
				common_contact_vars["{{id-cc-"].set_el_html("")
			}
		} else {
			cc_read_list = []
			common_contact_vars["{{id-cc-"].set_el_html("")
		}
	}

	$: {
		if ( (reply_to !== undefined) && !(from_contact) ) {
			special_contact_form_cid = reply_to.reply_with
			receiver_pub_key = reply_to.public_key
			if ( (typeof public_key === "string" ) && (typeof receiver_pub_key === "string" ) ) {
				if ( public_key !== receiver_pub_key ) {
					receiver_pub_key = false
				}
			}
		} else {
			receiver_pub_key = public_key ? public_key : false
			special_contact_form_cid = 'default'
		}
	}

	$: {
		if ( cid !== false ) {
			fetch_clear_cid(cid)
		}
	}

	$: {
		receiver_user_info.clear_cid = clear_cid
	}


	// "name": 'Hans Solo', "user_cid" : "4504385938", 
	// "subject" : "Darth Vadier Attacks", "date" : todays_date, "readers" : "joe,jane,harry",
	// "business" : false, "public_key" : false, "message" : "this is a message 1"



	let common_contact_vars = {
		"{{contact-top}}" : utils.cvar_factory("promail-mes-ed-contact",''),
		"{{id-to-" : utils.cvar_factory("promail-recipient","name"),
		"{{id-cid-" : utils.cvar_factory("promail-recipient","user_cid"),
		"{{id-date-" : utils.cvar_factory("promail-date","date"),
		"{{id-cc-" : utils.cvar_factory("promail-readers","readers"),
		"{{id-business-" : utils.cvar_factory("promail-business","business"),
		"{{id-subject-" : utils.cvar_factory("promail-subject"),
		"{{id-message-" : utils.cvar_factory("promail-message"),
		"{{id-sender_key-" : utils.cvar_factory("promail-sender_key","public_key"),
		"{{id-sender_signer_key-" : utils.cvar_factory("promail-sender_signer_key","signer_public_key"),
		"{{id-wrapped_key-" : utils.cvar_factory("promail-wrapped_key","wrapped_key"),
		"{{id-attachment-" : utils.cvar_factory("promail-attachments","attachments"),
	}


	let cform_var_supply = {
		"{{to}}" : name,
		"{{DOB}}" : DOB,
		"{{date}}" : (new Date()).toISOString(),
		"{{place_of_origin}}" : place_of_origin,
		"{{cool_public_info}}" : cool_public_info,
		"{{business}}" : business ? "business" : "profile",
		"{{public_key}}" : JSON.stringify(public_key),
		"{{signer_public_key}}" : JSON.stringify(signer_public_key),
		"{{cid}}" : JSON.stringify(active_identity.cid),
		"{{from}}" : active_identity.user_info ? active_identity.user_info.name : "",
		"{{clear_cid}}" : JSON.stringify(active_identity.clear_cid)
	}

	function process_variables(html,vars) {
		console.log(Object.keys(vars))
		for ( let cform_v in cform_var_supply ) {
			let instances = vars[cform_v]
			if ( instances !== undefined ) {
				let n = instances.length
				let value = cform_var_supply[cform_v]
				for ( let i = 0; i < n; i++ ) {
					html = html.replace(cform_v,value)
				}
			}
		}
		//
		html = utils.subst_vars_app_ids(html,vars,common_contact_vars)
		return(html)
	}



	// message_object_on_send
	//		-- constuct the message object

	function message_object_on_send(top_level_id) {
		//
		let message_object = {
			"name" : active_identity.user_info.name,
			"user_cid" : active_identity.cid,  // not the clear cid
			"subject" : common_contact_vars["{{id-subject-"].extract_value(),
			"date" : Date.now(),
			"readers" : common_contact_vars["{{id-cc-"].extract_value(),
			"business" : business,
			"message" :  common_contact_vars["{{id-message-"].extract_value(),
			"attachments" : attachments,
			"reply_with" : selected_contact_cid,
			//
			"public_key" : active_identity.user_info.public_key, 	// receiver will wrap keys back to me 
																	// (could send a different one other than the one used in establishing identity)
			"signer_public_key" : false,							// only send with intro
			//
			"nonce"  : gen_nonce()									// always send a fresh nonce
		}
		//
		if (  introduction ) {
			message_object.signer_public_key = active_identity.user_info.signer_public_key // receiver will verify my signature
		}
		//
		let message = message_object
		//
		if ( use_previous ) {
			message.message += "<br><br><br>=====================================================<br>"
			message.message += previous_message
		}
		//
		return(message)
	}

	async function init_contact_form_cids(r_info) {
		r_cid = false
		if ( r_info.public_key && r_info.signer_public_key ) {
			r_cid =  await ipfs_profiles.fetch_contact_cid(r_info,false)  // established contact
		}
		r_p_cid = await ipfs_profiles.fetch_contact_cid(r_info,true)	// introduction or no privacy intended
	}

	let r_cid = false		// receiver's private contact cid
	let r_p_cid = false 	// receiver's public contact cid
	//
	let user_cid = false	// the active user cid of sender (user of client)
							// This is for retreiving keys, encryptors, etc. out of local storage

	$: user_cid = active_identity ? active_identity.cid : false

	$: {
		if ( active_identity && name ) {
			receiver_user_info = {
				"name" : name,
				"DOB" : DOB,
				"place_of_origin" : place_of_origin,
				"cool_public_info" : cool_public_info,
				"business" : business,
				"public_key" : public_key,
				"signer_public_key" : signer_public_key,
				"biometric" : biometric
			}
			init_contact_form_cids(receiver_user_info)
		}
	}

	$: {
		if ( active_identity ) {
			cform_var_supply = {
				"{{to}}" : name,
				"{{DOB}}" : DOB,
				"{{date}}" : (new Date()).toISOString(),
				"{{place_of_origin}}" : place_of_origin,
				"{{cool_public_info}}" : cool_public_info,
				"{{business}}" : business ? "business" : "profile",
				"{{public_key}}" : JSON.stringify(public_key),
				"{{cid}}" : JSON.stringify(active_identity.cid),
				"{{from}}" : active_identity.user_info ? active_identity.user_info.name : "",
				"{{clear_cid}}" : JSON.stringify(active_identity.clear_cid)
			}
		}
	}

	let todays_date = ''
	$: 	{
		todays_date = (new Date()).toISOString()
	}

	let contact_page = ""

	let b_label = ""
	let know_of = ""
	$: b_label = business ? " is a business" : " is a person"
	$: know_of = (public_key !== false) ? " is someone I know" : " is a new introduction"

	function toggle_showkey() {
		show_key = show_key ? false : true
		console.log(show_key)
	}

	let previous_message = ""
	$: previous_message = answer_message ? JSON.stringify(reply_to,null,4) : ""

	async function fetch_clear_cid(cid) {
		let ccid_container = await ipfs_profiles.fetch_cid_json(cid)
		if ( ccid_container ) {
			clear_cid = ccid_container.clear_cid
			return clear_cid
		}
		return false
	}

	async function start_introduction() {
		introduction = true
		message_was_sent = false
		cc_read_list = []
		cc_index = 0
		//
		// the user cid (active identity) gets any services for handling encryption locally.
		// The receiver information will be stored as part of the data if encryption is required
		let contact_page_descr = await ipfs_profiles.fetch_contact_page(active_identity,business,'default',r_p_cid)
		if ( contact_page_descr ) {
			let html = (contact_page_descr.html === undefined) ? contact_page_descr.txt_full : contact_page_descr.html
			contact_page = process_variables(html,contact_page_descr.var_map) // decodeURIComponent(html)
			//
			let script = contact_page_descr.script
			if ( script ) {
				script = decodeURIComponent(script)
				script = script.replace("{{when}}",Date.now())
				addscript(script,"blg-window-full-text-outgo-script",true)
			}

			console.log(contact_page_descr.var_map)
		}
		//
	}


	async function start_composing() {
		introduction = false
		message_was_sent = false
		cc_read_list = []
		cc_index = 0
		//
		// the user cid (active identity) gets any services for handling encryption locally.
		// The receiver information will be stored as part of the data if encryption is required
		// figure out how to get custom cids from inbound messages...
		let contact_page_descr = false
		if ( special_contact_form_cid && (special_contact_form_cid !== 'default') ) {
			contact_page_descr = await ipfs_profiles.fetch_contact_page(active_identity,business,'cid',special_contact_form_cid)
		} else {
			contact_page_descr = await ipfs_profiles.fetch_contact_page(active_identity,business,'default',r_cid)
		}
		//
		if ( !contact_page_descr && r_cid ) {
			contact_page_descr = await ipfs_profiles.fetch_contact_page(active_identity,business,'default',r_cid)
		}
		//
		if ( contact_page_descr ) {
			let html = (contact_page_descr.html === undefined) ? contact_page_descr.txt_full : contact_page_descr.html
			contact_page = process_variables(html,contact_page_descr.var_map) // decodeURIComponent(html)
			//
			let script = contact_page_descr.script
			if ( script ) {
				script = decodeURIComponent(script)
				script = script.replace("{{when}}",Date.now())
				addscript(script,"blg-window-full-text-outgo-script",true)
			}
		}
		//
	}

	// // // // // // 
	//
	async function ipfs_sender(message) {
		// message_object_on_send()
		switch ( message_type ) {
			case "introduction" : {
				let identify = active_identity
				if ( identify ) {
					let i_cid = await ipfs_profiles.send_introduction(receiver_user_info,identify,message)
					if ( i_cid ) {
						if ( identify.introductions === undefined ) {
							identify.introductions = []
						}
						identify.introductions.push(i_cid)
						update_identity(identify)
						message_was_sent = true
					}
				}
				break;
			}
			default: {
				let identify = active_identity
				if ( identify ) {
					let clear_cid = await fetch_clear_cid(cid)
					receiver_user_info.clear_cid = clear_cid
					let m_cid = await ipfs_profiles.send_message(receiver_user_info,identify,message)
					if ( m_cid ) {
						if ( identify.messages === undefined ) {
							identify.messages = []
						}
						identify.messages.push(m_cid)
						update_identity(identify)
						message_was_sent = true
					}
				}
				break;
			}
		}
	}
	
	//
	onMount(() => {
		if ( window._app_set_default_message_sender !== undefined ) {
			window._app_set_default_message_sender(common_contact_vars,cform_var_supply,message_object_on_send,ipfs_sender)
		}
	})

	async function drop(ev) {
		ev.preventDefault();
		try {
			let files = ev.dataTransfer.files ? ev.dataTransfer.files : false
			let items = ev.dataTransfer.items ? ev.dataTransfer.items : false
			let [fname,blob64] = await utils.drop(items,files)
			//
			let fcid = await ipfs_profiles.upload_data_file(fname,blob64)
			attachments.push(fcid)
			common_contact_vars["{{id-attachment-"].set_el_html(attachments.join(','))

		} catch (e) {}
	}

	function dragover(ev) {
		ev.preventDefault();
	}

</script>
 
<div class="blg-el-wrapper-full" >
	<div style="padding:6px;" >
		<span class="cool-label" style="background-color: yellowgreen">{todays_date}</span>
		<span class="message_indicator">Sending a message to:</span> <span class="name">{name},</span>
		<div class="tool-holder" >
			<span class="about_name">Who {b_label} and {know_of}.</span>	
			<div class="cool-stuff">
				{name} comes from {place_of_origin} and wants you to know that: &quot;{cool_public_info}&quot;
			</div>
		</div>

		<div class="tool-holder" >
			<div class="subline">
			You are requesting a response through contact form: <span style="font-weight: bold;">{reply_with}</span>
			</div>
			Custom contact form choices:
			<select bind:value={cform_index}>
				{#each augmented_contact_form_list as contact_item, cform_index}
					<option value={cform_index}>{contact_item.info}</option>
				{/each}
			</select>
			<br>
			<span style="font-size:65%">{selected_contact_cid}</span>
		</div>
	</div>

	{#if answer_message }
	<div class="tool-holder">
		<span class="large-text-label" >Previous Message:</span>
		<span  class="small-text-label" >include</span><input type="checkbox" bind:checked={use_previous}  >
		<div id="blg-window-full-text-previous"  class="full-display" >
			{@html previous_message}
		</div>
	</div>
	{/if}
	<div class="tool-holder">
		<span class="large-text-label" >Compose message here:</span>
		{#if receiver_pub_key !== false }
			<button class="medium_button" on:click={start_composing}>begin composition</button>
		{:else}
			<button class="medium_button" on:click={start_introduction}>begin introduction</button>
		{/if}
		<span class="add-attachemnt" on:drop={drop} on:dragover={dragover} >Drop attachment here (&#128206;)</span>
		<span>CC</span> 
		<select bind:value={cc_index}>
			{#each cc_select_list as cc_item, cc_index}
				<option value={cc_index}>{cc_item.name}</option>
			{/each}
		</select>
		{#if message_was_sent } 
			<span class="message-sent">Message was sent</span>
		{/if}
	</div>
	<div id="blg-window-full-text-outgo"  class="full-display-bottom" >
		{@html contact_page}
	</div>
	<div id="blg-window-full-text-outgo-script" class="is-nothing" ></div>
	<div style="background-color:whitesmoke;font-weight: 600;font-size: smaller;">
		<span style="font-weight:bold;color:black">contact cid:</span> {cid} 
		{#if !(show_key) }
			<button style="float:right" on:click={toggle_showkey}>(▼)</button>
		{:else}
			<button style="float:right" on:click={toggle_showkey}>(^)</button>
		{/if}
	</div>
	{#if show_key }
	<div class="viz-key" style="background-color:whitesmoke;font-weight: 600;font-size: smaller;">
		<span style="font-weight:bold;color:black">public wrapper key:</span> {public_key}
	</div>
	{:else}
	<div class="hide-key" style="background-color:whitesmoke;font-weight: 600;font-size: smaller;">
		<span style="font-weight:bold;color:black">public wrapper key:</span> {public_key}
	</div>
	{/if}
</div>
<style>

	.blg-el-wrapper-full {
		overflow-y: hidden;
		height:inherit;
	}


	.cool-label {
		display: inline-block;
		padding: 0.2em 0.5em;
		margin: 0 0.2em 0.2em 0;
		text-align: center;
		border-radius: 0.2em;
		color: white;
	}


	.add-attachemnt {
		display: inline-block;
		padding: 0.2em 0.5em;
		margin: 0 0.2em 0.2em 0;
		text-align: center;
		border-radius: 0.2em;
		border: solid 1px darkslategray;
		color: rgb(19, 68, 6);		
	}

	.add-attachemnt:hover {
		background-color:rgb(244, 252, 244);
		cursor:copy;
	}

	.blg-item-title {
		color:black;
		display: unset;
		border-bottom: 1px darkslateblue solid;
	}

	.blg-item-subject {
		color:black;
		display: unset;
	}


	.full-display {
		background-color: rgba(255, 255, 255, 0.9);
		color: rgb(73, 1, 1);
		border-top: solid 2px rgb(88, 4, 88);
		padding: 6px 4px 6px 4px;
		overflow-y: scroll;
		height: 60px;
		border-bottom: solid 1px rgb(88, 4, 88);
	}

	.full-display-bottom {
		background-color: rgba(255, 255, 255, 0.9);
		color: rgb(73, 1, 1);
		border-top: solid 2px rgb(88, 4, 88);
		padding: 6px 4px 6px 4px;
		overflow-y: scroll;
		height: calc(75vh - 300px);
		border-bottom: solid 1px rgb(88, 4, 88);
	}

	h6 {
		background-color: rgb(245, 245, 245);
		border: 1px black solid;
		border-radius: 0.2em;
		padding: 0.2em 0.5em;
		margin: 0 0.2em 0.2em 0;
		color:black;
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
		width: 200px;
	}

	.message_indicator {
		color:rgb(2, 32, 21);
		font-weight: bold;
	}
	.name {
		font-weight: bold;
		font-size: x-large;
		color:rgb(71, 15, 29);
	}
	.about_name {
		color:rgb(88, 4, 88);
		border-bottom: 1px solid deepskyblue;
		margin-bottom:6px;
	}
	.cool-stuff {
		font-weight: bold;
		color:rgb(29, 73, 75);
		display:inline-block;
	}

	.large-text-label {
		color:rgb(33, 7, 95);
		font-weight: bold;
		font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
		font-style: oblique;
		font-style: 105%;
		margin:2px
	}

	.small-text-label {
		color:rgb(33, 7, 95);
		font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
		padding:2px;
		margin:2px
	}

	.medium_button {
		width:25%;
	}

	.is-nothing {
		display: none;
		visibility: hidden;
	}

	.viz-key {
		visibility: visible;
		display: block;
	}
	.hide-key {
		visibility: hidden;
		display: none;
	}

	button:disabled {
		cursor:not-allowed;
	}

	@keyframes blink {
		50% { border-color: #ff0000; } 
	}
	
	.message-sent {
		color: rgb(221, 131, 12);
		background-color: rgb(223, 240, 223);
		font-weight: bold;
		border: solid 2px firebrick;
		padding: 4px;
		animation: blink .5s step-end infinite alternate;
	}

	.tool-holder {
		width: 100%;
		border: solid 1px burlywood;
		padding:4px;
		margin-top:0px;
		margin-bottom:2px;
		background-color: rgb(255, 253, 247);
	}

	.tool-holder .subline {
		font-style:oblique;
		color:rgb(46, 7, 73);
		background-color: rgba(249, 255, 240, 0.877);
		border-bottom: lightsteelblue 1px solid;
		width:100%;
	}

</style>