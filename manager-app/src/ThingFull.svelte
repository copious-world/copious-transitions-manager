<script>

	// ref ... https://gist.github.com/akirattii/9165836

	// `current` is updated whenever the prop value changes...
	export let color;
	export let entry;
	export let title;
	export let dates;
	export let subject;
	export let keys;
	export let t_type;
	export let txt_full;


	$: key_str = keys.join(', ')

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

	if ( t_type !== 'markdown' ) {
		txt_full = decodeURIComponent(txt_full)
	}

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
	

</script>
 
<div class="blg-el-wrapper-full">
	<div style="padding:6px;" >
		<span style="background-color: {color}">{entry}</span>
		<span style="background-color: yellowgreen">{created_when}</span>
		<span style="background-color: lightblue">{updated_when}</span>
		<h4 class="blg-item-title" style="background-color: inherit;">{title}</h4>
		<h6>{key_str}</h6>
		<div>
			<span style="background-color:navy">subject</span>&nbsp;&nbsp;<h5 class="blg-item-subject" >{subject}</h5>
		</div>
	</div>
	<div id="blg-window-full-text"  class="full-display" >
		{@html txt_full}
	</div>
</div>

<style>

	.blg-el-wrapper-full {
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
		height: 100px;
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
</style>