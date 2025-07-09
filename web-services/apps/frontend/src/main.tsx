import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Appbar from './components/Appbar.tsx'
import { ThemeProvider } from './components/themeProvider.tsx'

createRoot(document.getElementById('root')!).render(
    <ThemeProvider defaultTheme='dark'>
        <Appbar/>
        <App />
    </ThemeProvider>
)
