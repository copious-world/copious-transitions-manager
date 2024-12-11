<script>

let { host_list = $bindable([]), ...props } = $props();

</script>

<div class="nice_message">
  <div class="inner_div">
    {#each host_list as host }
      <button>{host.addr}</button> &nbsp;<span>{host.cloud}</span> &nbsp;<span>{host.info}</span><br>
    {/each}
  </div>
</div>

<style>

	.inner_div {
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
		width: fit-content;
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
