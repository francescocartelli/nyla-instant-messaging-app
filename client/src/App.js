import './App.css'

import { Footer } from 'components/UI/Footer'

import { Home } from 'components/Pages/Home/Home'

function App() {
  return (
    <div className="App">
      <div className="main-container">
        <div className='d-flex flex-column flex-grow-1 align-items-center mb-2'>
          <Home />
        </div>
        <div className="flex-row justify-content-center hide">
          <Footer />
        </div>
      </div>
    </div>
  )
}

export default App
