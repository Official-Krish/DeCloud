import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Appbar from './components/Appbar.tsx'
import { ThemeProvider } from './components/themeProvider.tsx'
import Footer from './components/Footer.tsx'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { clusterApiUrl } from '@solana/web3.js'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { ToastContainer } from 'react-toastify'
import LaneText from './components/Lane.tsx'

createRoot(document.getElementById('root')!).render(
    <ThemeProvider defaultTheme='dark'>
        <ConnectionProvider endpoint={clusterApiUrl('devnet')}>
        <WalletProvider wallets={[]} autoConnect>
            <WalletModalProvider>
                <ToastContainer/>
                {window.location.pathname.startsWith("/ssh/") ? null : <LaneText />}
                <Appbar/>
                <App />
                <Footer />
            </WalletModalProvider>
        </WalletProvider>
        </ConnectionProvider>
    </ThemeProvider>
)
