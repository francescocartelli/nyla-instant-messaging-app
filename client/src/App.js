import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Switch, Route } from "react-router-dom"

import './App.css'

import { Nav } from 'components/UI/Nav/Nav'
import { Footer } from 'components/UI/Footer/Footer'

import { Home } from 'components/Pages/Home/Home'
import { Account } from './components/Pages/Account/Account'

import usersAPI from 'api/userAPI'

function App() {
  const [user, setUser] = useState(false)
  const [isWaitingUser, setWaitingUser] = useState(true)

  useEffect(() => {
    usersAPI.getCurrentUser().then((user) => {
      setUser(user)
      setWaitingUser(false)
    }).catch((err) => {
      setUser(false)
      setWaitingUser(false)
    })
  }, [])

  return (
    <Router>
      <div className="App">
        <div className="main-container">
          <Nav isWaitingUser={isWaitingUser} user={user} setUser={setUser} logout={() => usersAPI.logout()}/>
          <div className='d-flex flex-column flex-grow-1 align-items-center adaptive-m mb-2'>
            <Switch>
              {!isWaitingUser && !user && <Route path={["/account"]}>
                <Account setUser={setUser} />
              </Route>}
              <Route path="/">
                <Home />
              </Route>
            </Switch>
          </div>
          <div className="flex-row justify-content-center hide">
            <Footer />
          </div>
        </div>
      </div>
    </Router >
  )
}

export default App
