import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import { Dashboard } from './pages/Dashboard'
import { RentVM } from './pages/RentVm'
import { VMDetails } from './pages/vmDetail'
import { Hosting } from './pages/Hosting'
import { SignUp } from './pages/Signup'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { clusterApiUrl } from '@solana/web3.js'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import '@solana/wallet-adapter-react-ui/styles.css';
import { SignIn } from './pages/Signin';
import { PhantomWalletAdapter, AlphaWalletAdapter } from '@solana/wallet-adapter-wallets';


function App() {
  return (
    <>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Landing/>} />
                <Route path="/dashboard" element={<Dashboard/>} />
                <Route path="/rent" element={<RentVM/>} />
                <Route path="/vm/:id" element={<VMDetails/>} />
                <Route path="/hosting" element={<Hosting/>} />
                <Route path="/signup" element={<SignUp/>} />
                <Route path="/signin" element={<SignIn/>} />
              </Routes>
            </BrowserRouter>
    </>
  )
}

export default App
