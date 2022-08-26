import App from './App.svelte';

const app = new App({
	target: document.getElementById('app-main'),
	props: {
		name: 'My Blog With Grid'
	}
});

export default app;