<script>

	// all of these fields come in from the message 
	export let name;
	export let user_cid;
	export let subject;
	export let date;
	export let readers;
	export let business;
	export let public_key;
	export let signer_public_key;
	export let nonce;
	export let message;
	export let is_in_contacts;
	export let attachments;

	import * as ipfs_profiles from './ipfs_profile_proxy.js'
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	import * as utils from "./utilities.js"

	function do_reply() {
		dispatch('message', {
			'cmd': 'reply',
			'cid' : user_cid
		});
	}

	function add_to_contacts() {
		dispatch('message', {
			'cmd': 'new-contact',
			'cid' : user_cid,
			'signer_public_key' : signer_public_key
		});
	}

	let attachments_display = ""
	$: {
		if ( attachments !== undefined ) {
			if ( Array.isArray(attachments) ) {
				if ( attachments.length ) {
					attachments_display = attachments.join(',')
				} else {
					attachments_display = "none"
				}
			}
			attachments_display = utils.clear_char(attachments_display,"&nbsp;")
			attachments_display = utils.clear_char(attachments_display,"\n")
			attachments_display = utils.clear_char(attachments_display,"\t")
			attachments_display = utils.clear_char(attachments_display," ")
			//
			if ( attachments_display !== "none" ) {

			}
		} else {
			attachments_display = "none"
		}
	}

	let readers_display = ""
	$: {
		if ( readers !== undefined ) {
			if ( Array.isArray(attachments) ) {
				if ( readers.length ) {
					readers_display = attachments.join(',')
				} else {
					readers_display = "none"
				}
			}
			readers_display = utils.clear_char(attachments_display,"&nbsp;")
			readers_display = utils.clear_char(attachments_display,"\n")
			readers_display = utils.clear_char(attachments_display,"\t")
			readers_display = utils.clear_char(attachments_display," ")
		} else {
			readers_display = "none"
		}
	}


	async function downloader(f_cid) {
		let attached_file = await ipfs_profiles.load_blob_as_url(f_cid)
		generic_downloader(attached_file)
	}

</script>
 
<div class="blg-el-wrapper-full" >
	<div style="padding:6px;" >
		<span class="cool-label"  style="background-color: darkgreen">{date}</span>
		<span class="cool-label"  style="background-color: limegreen">From:</span>
		<h4 class="blg-item-title" style="background-color: inherit;">{name}</h4>
		<span class="show-cid">{user_cid}</span>
		<div class="buttons">
			<div class="little-info">
				{name} is a { business ? "business" : "person" }
			</div>
			{#if !(is_in_contacts) }
			<button on:click={add_to_contacts} >Add Contact</button>
			{/if}
			<button on:click={do_reply} disabled={!(is_in_contacts)} >Reply</button>
		</div>
		<div>
			<span class="cool-label"  style="background-color:navy">CC:</span>{readers_display}
		</div>
		<div>
			<span class="cool-label" style="background-color:navy">subject</span>&nbsp;&nbsp;{@html subject}
		</div>
	</div>
	<div style="border-bottom: slategrey solid 1px;margin-bottom: 4px;background-color:snow;">
		<span class="useful-label" >Attachments:</span>
		{#if attachments_display === 'none' }
			<div style="display:inline-block;color:darkgreen">{attachments_display}</div>
		{:else}
			{#each attachments as attached }
				<span class="attachment-click" on:click={() => downloader(attached)}>{attached}</span>
			{/each}
		{/if}
	</div>
	<div class="message-header">
		<span class="useful-label" style="font-size: small;">Message:</span>
	</div>
	<div id="blg-window-full-text"  class="full-display" >
		{@html message}
	</div>
	<input type="hidden" id="pub-key" bind:value={public_key} />
</div>

<style>

	.blg-el-wrapper-full {
		overflow-y: hidden;
		height:inherit;
		padding:4px;
	}


	.cool-label {
		display: inline-block;
		padding: 0.2em 0.5em;
		margin: 0 0.2em 0.2em 0;
		text-align: center;
		border-radius: 0.2em;
		color: white;
	}

	.useful-label {
		font-weight: bold;
		color:rgb(36, 71, 51)
	}

	.message-header {
		background-color: rgb(247, 247, 224);
	}

	.blg-item-title {
		color:black;
		display: unset;
		border-bottom: 1px darkslateblue solid;
		font-size: large;
	}


	.full-display {
		background-color: rgba(255, 255, 255, 0.9);
		color: rgb(73, 1, 1);
		border-top: solid 2px rgb(88, 4, 88);
		padding: 6px 4px 6px 4px;
		overflow-y: scroll;
		height: 100px;
		border-bottom: solid 1px rgb(88, 4, 88);
	}


	.buttons {
		clear: both;
	}

	.buttons button:disabled {
		color:slategrey;
		border-bottom-color: rgb(233, 237, 240);
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
	}


	button:disabled {
		cursor:not-allowed;
	}


	.little-info {
		font-size: 0.87em;
		display: inline-block;
	}

	.show-cid {
		font-weight: bold;
		font-size:x-small;
		font-style: oblique;
	}


	.attachment-click {
		border: beige 1px solid;
		cursor: pointer;
		margin-left: 4px;
	}

	.attachment-click:hover {
		color:green;
		background-color: rgb(253, 253, 244);
	}
</style>