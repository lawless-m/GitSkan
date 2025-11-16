import './app.css'
import App from './App.svelte'
import Callback from './Callback.svelte'

// Simple routing: check if we're on the callback page
const isCallback = window.location.pathname === '/callback';

const app = isCallback
  ? new Callback({
      target: document.getElementById('app'),
    })
  : new App({
      target: document.getElementById('app'),
    });

export default app
