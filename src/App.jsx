import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import DBFReader from './components/DBFReader'
import './App.css'
import CssBaseline from '@mui/material/CssBaseline'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <CssBaseline />
        <div className='liquor-app'>
         
          <DBFReader />
         
        </div>
      </LocalizationProvider>
    </>
  )
}

export default App
