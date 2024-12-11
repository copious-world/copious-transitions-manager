<script>

let { admin_pass = $bindable("empty"), ...props } = $props();

let password_view_type = $state(true);

function toggle_password_view() {
  password_view_type = !password_view_type
}

</script>

<div class="nice_message">
  <div class="inner_div">
    <div style="display:inline-block;text-align:left;vertical-align: top;">
      <button  style="font-size:small" onclick={toggle_password_view}>&#x1F441;</button>&nbsp;
      {#if password_view_type }
      <label for="admin-pass">Admin Password:</label> &nbsp;<input type="password" id="admin-pass" bind:value={admin_pass} {...props}  />
      {:else}
      <label for="admin-pass">Admin Password:</label> &nbsp;<input type="text" id="admin-pass" bind:value={admin_pass} {...props} />
      {/if}
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
    vertical-align: top;
	}

	.nice_message {
    display: inline-block;
    vertical-align: top;
    height: 40px;
    margin-bottom: 10%;
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
