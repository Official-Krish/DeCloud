import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import { Dashboard } from './pages/Dashboard'
import { RentVM } from './pages/RentVm'
import { VMDetails } from './pages/vmDetail'

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing/>} />
          <Route path="/dashboard" element={<Dashboard/>} />
          <Route path="/rent" element={<RentVM/>} />
          <Route path="/vm/?id" element={<VMDetails/>} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
