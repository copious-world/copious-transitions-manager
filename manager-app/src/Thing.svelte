<script>
	// `current` is updated whenever the prop value changes...
	export let color;
	export let entry;
	export let title;
	export let dates;
	export let subject;
	export let keys;
	export let t_type;
	export let txt_full;
	export let score;
	export let components
	export let id;


	if ( t_type !== 'markdown' ) {
		txt_full = decodeURIComponent(txt_full)
	}


	let truncated
	$: truncated = txt_full.substr(0,250) + "&#8230;"

	$: key_str = keys.join(', ')

	let score_rounded

	$: score_rounded = score.toFixed(3);

	let graphics
	$:  graphics = components.graphic.map(grph => {  return decodeURIComponent(grph)  })


	function convert_date(secsdate) {
		if ( secsdate === 'never' ) {
			return 'never';
		} else {
			let idate = parseInt(secsdate)
			let dformatted = (new Date(idate)).toLocaleDateString('en-US')
			return (dformatted)
		}
	}

	let updated_when
	let created_when

	$: updated_when = convert_date(dates.updated)
	$: created_when = convert_date(dates.created)

	let short_title
	$: short_title = title.substr(0,16) + '...'

	let short_subject
	$: short_subject = subject.substr(0,32) + '...'

	/*
			"dates" : {
				"created" : "never",
				"updated" : "never"
			},
			"subject" : "",
			"keys" : [  ],
			"t_type" : "",
			"txt_full" : ""
	*/

</script>

{#if dates.created != 'never' }
<div class="blg-el-wrapper" >
	
	<span style="background-color: {color}">{entry}</span>
	<span style="background-color: yellowgreen">{created_when}</span>
	<span style="background-color: lightblue">{updated_when}</span>
	<h4 class="blg-item-title" style="background-color: inherit;">{short_title}</h4>
	<span class="thng-score">{score_rounded}</span>
	<div>
	<span style="background-color:navy">subject</span>&nbsp;&nbsp;<h5 class="blg-item-subject" >{short_subject}</h5>
	</div>
	<div class="teaser">
		{#each graphics as grph}
			<div class="little-component" style="height:60px;width:60px;">
				{@html grph}
			</div>
		{/each}
	</div>	
</div>

{:else}
<div class="blg-el-wrapper">
	<h4 class="blg-item-title" style="background-color: lightgrey;color:darkgrey">End of Content</h4>
</div>
{/if}
<style>

	.blg-el-wrapper {
		overflow-y: hidden;
		height:inherit;
	}

	span {
		display: inline-block;
		padding: 0.2em 0.5em;
		margin: 0 0.2em 0.2em 0;
		text-align: center;
		border-radius: 0.2em;
		color: white;
	}

	.little-component {
		display: inline-block;
		vertical-align: middle;
		width: 60px;
		height: 60px;
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

	.thng-score {
		background-color: rgb(247, 247, 225);
		color: rgb(4, 4, 104);
		font-size: 0.60em;
		font-weight: bold;
		border: solid 1px rgb(233, 233, 164);
	}

	.teaser {
		margin-top: 3px;
		border-top: 1px solid black;
		font-size: 70%;
		color:rgba(129, 129, 129);
		background-color:rgb(250, 248, 248);
		max-height: 90px;
		overflow-y: hidden;
		text-overflow: ellipsis;
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

	@media (max-width: 1200px) {
		.teaser {
			max-height: 60px;
		}
	}

	@media (max-width: 1000px) {
		.teaser {
			max-height: 80px;
		}
	}

	@media (max-width: 900px) {
		.teaser {
			max-height: 64px;
		}
	}

	@media (max-width: 700px) {
		.teaser {
			max-height: 60px;
		}
	}

	@media (max-width: 600px) { 
		.teaser {
			max-height: 80px;
		}
	}
</style>