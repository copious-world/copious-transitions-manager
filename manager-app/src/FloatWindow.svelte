

<script>
	// `current` is updated whenever the prop value changes...

	export let title;
	export let scale_size_array;
	export let use_smoke = true;
	export let index = 0;

	import { onMount } from 'svelte';

	var SCROLL_WIDTH = 24;

	// 

	//-- let the popup make draggable & movable.
	var offset = { x: 0, y: 0 };

	let scale_size_custom = scale_size_array

	onMount(() => {
		//
		var popup = document.getElementById(`popup_${index}`);
		var popup_bar = document.getElementById(`popup_bar_${index}`);
		var btn_close = document.getElementById(`btn_close_${index}`);
		var smoke = document.getElementById(`smoke_${index}`);
		//
		popup_bar.addEventListener('mousedown', mouseDown, false);
		window.addEventListener('mouseup', mouseUp, false);

		window.onkeydown = (e) => {
			if(e.keyCode == 27){ // if ESC key pressed
				var btn_close = document.getElementById(`btn_close_${index}`);
				//btn_close.click(e);

				var popup = document.getElementById(`popup_${index}`);
				popup.style.display = "none";
				if ( smoke ) smoke.style.display = "none";

			}
		}

		btn_close.onclick = (e) => {
			var popup = document.getElementById(`popup_${index}`);
			popup.style.display = "none";
			if ( smoke ) smoke.style.display = "none";
		}

		window.addEventListener("resize",(e) => {
			spreadSmoke(use_smoke);
		})


		window.start_floating_window = (index) => {
			popup_starter(index)
		}

	})


	function fix_height(ii,startup_delta) {
		let txt_area = document.getElementById('blg-window-full-text');
		if ( txt_area ) {
			//
			txt_area._blg_app_resized = true
			//
			let r = txt_area.getBoundingClientRect();
			//
			var popup = document.getElementById(`popup_${ii}`);
			if ( popup ) {
				let rp = popup.getBoundingClientRect();
				let h = Math.floor(rp.bottom - r.top) - startup_delta
				txt_area.style.height = h + "px";
			}
		}
	}

	function popup_starter(ii) {
		spreadSmoke(use_smoke);
		var popup = document.getElementById(`popup_${ii}`);
		if ( popup.style.display !== 'block') {
			popup.style.top = "4px";
			popup.style.left = "4px";
			popup.style.width = (window.innerWidth*scale_size_custom[ii].w) - SCROLL_WIDTH + "px";
			popup.style.height = (window.innerHeight*scale_size_custom[ii].h) - SCROLL_WIDTH + "px";
			popup.style.display = "block";
			setTimeout(() => { fix_height(ii,4); },40)
		}
		setTimeout(() => { fix_height(ii,4); },20)
	}

	function mouseUp() {
		window.removeEventListener('mousemove', popupMove, true);
	}

	function mouseDown(e) {
		var popup = document.getElementById(`popup_${index}`);
		offset.x = e.clientX - popup.offsetLeft;
		offset.y = e.clientY - popup.offsetTop;
		window.addEventListener('mousemove', popupMove, true);
	}

	function popupMove(e){
		var popup = document.getElementById(`popup_${index}`);
		popup.style.position = 'absolute';
		var top = e.clientY - offset.y;
		var left = e.clientX - offset.x;
		popup.style.top = top + 'px';
		popup.style.left = left + 'px';
	}
	//-- / let the popup make draggable & movable.


	function spreadSmoke(flg) {
		if ( flg ) {
			var smoke = document.getElementById(`smoke_${index}`);
			if ( smoke ) {
				if ( smoke ) smoke.style.width = window.outerWidth + 100 + "px";
				if ( smoke ) smoke.style.height = window.outerHeight + 100 + "px";
				if (smoke && (flg != undefined) && (flg == true)) smoke.style.display = "block";
			}
		}
	}

</script>

{#if use_smoke }
<div id="smoke_{index}" class="smoke">...</div>
{/if}
<div id="popup_{index}"  class="popup" >
	<div id="popup_bar_{index}" class="popup_bar" >
	  {title}
	  <span id="btn_close_{index}" class="btn_close" >[X]</span>
	</div>
  <p style="font-size:0.75em;font-weight:bold;color:darkgreen;padding-left:4px">Press ESC to close window.</p>
  <slot></slot>
</div>


<style>
	
	.smoke {
		display:none;
		position:absolute;
		top:-30px;
		left:-30px;
		opacity:0.3;
		background-color:black;
		z-index:9998
	}

	.popup {
		display:none;
		background-color:rgb(255, 255, 255);
		position:absolute;
		top:0px;
		z-index:9999;
		box-shadow: 6px 6px 5px #888888;
		border-radius:6px;
		border:1px solid #4f4f4f;
		width: 40%
	}

	.popup_bar {
		width:100%;
		background-color:#76d825;
		position:relative;top:0;
		border-radius:6px 6px 0 0;
		text-align:center;
		height:24px;
		cursor:move
	}

	.btn_close {
		float:right;
		cursor:pointer;
		padding-right:6px;
	}

</style>