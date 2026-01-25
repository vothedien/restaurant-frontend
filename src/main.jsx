import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { initAuthFromStorage } from "./auth/authStore";

import App from './App.jsx'
initAuthFromStorage();
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
