import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import { Dashboard } from './pages/Dashboard'
import { RentVM } from './pages/RentVm'
import { VMDetails } from './pages/vmDetail'
import { Hosting } from './pages/Hosting'
import { SignUp } from './pages/Signup'
import '@solana/wallet-adapter-react-ui/styles.css';
import { SignIn } from './pages/Signin';
import SSHTerminal from './pages/Terminal'
import { AdminPage } from './pages/Admin'
import { ComingSoon } from './components/ComingSoon'

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
          <Route path="/ssh/:id" element={<SSHTerminal/>} />
          <Route path="/admin" element={<AdminPage/>} />
          <Route path="*" element={<ComingSoon isDepin={false}/>} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
