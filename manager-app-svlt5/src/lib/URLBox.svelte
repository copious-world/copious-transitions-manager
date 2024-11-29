<script>

let { manual_url = $bindable(""), ...props } = $props();

</script>

<div class="nice_message">
  <div class="inner_div">
    <div style="display:inline-block;text-align:left">
      &tridot;&nbsp;
      <label for="admin-pass">Custom URL:</label> &nbsp;<input type="text" id="manual-url" bind:value={manual_url} {...props}  />
    </div>
  </div>
</div>

<style>

	.inner_div {
		padding-left: 2px;
		border-bottom: 1px lightgray solid;
		min-height: 40px;
    max-height: 60px;
    vertical-align: top;
	}

	.inner_div label {
		font-size:smaller;
	}

	.nice_message {
    display: inline-block;
    vertical-align: top;
    height: 40px;
		width: fit-content;
    max-height: 40px;
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
    border-radius: 35%;
  }

</style>
