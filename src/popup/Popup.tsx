import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'

function Popup() {
  return (
    <div>
      Hello World
    </div>
  )
}

// Mount the Popup
const root = document.getElementById('root')
if (root) {
  createRoot(root).render(
    <StrictMode>
      <Popup />
    </StrictMode>
  )
} 