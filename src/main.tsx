import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import {ContextProvider} from './components/context'



createRoot(document.getElementById('root')!).render(
  <StrictMode>
<ContextProvider><App/></ContextProvider>
</StrictMode>,
)