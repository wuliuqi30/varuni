import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import LiquorApp from './components/LiquorApp'
import './App.css'
import CssBaseline from '@mui/material/CssBaseline'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap styles
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Bootstrap JavaScript plugins


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <CssBaseline />    
          <LiquorApp />     
      </LocalizationProvider>
    </>
  )
}

export default App
