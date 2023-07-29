import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Switch, Route } from "react-router-dom"

import './App.css'

import 'styles/style.css'
import 'styles/colors.css'

import { IsLogged, IsNotLogged } from 'components/Common/Barriers'

import { Footer } from 'components/UI/Footer/Footer'
import { Nav } from 'components/UI/Nav/Nav'

import { Account } from './components/Pages/Account/Account'
import { Home } from 'components/Pages/Home/Home'
import { UsersSearch } from 'components/Pages/Users/Users'
import { PersonalChats } from 'components/Pages/Chats/Chats'
import { Chat } from 'components/Pages/Chats/Chat'

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

  const AuthWall = ({ children }) => {
    return <>
      <IsLogged isWaitingUser={isWaitingUser} user={user} >
        {children}
      </IsLogged>
      <IsNotLogged isWaitingUser={isWaitingUser} user={user}>
        <Account setUser={setUser} />
      </IsNotLogged>
    </>
  }

  return (
    <Router>
      <div className="App">
        <div className="main-container">
          <Nav isWaitingUser={isWaitingUser} user={user} setUser={setUser} logout={() => usersAPI.logout()} />
          <div className='mt-nav'><p>-</p></div>
          <div className='d-flex flex-column align-items-center flex-grow-1 adaptive-p'>
            <Switch>
              <Route path="/account">
                <IsNotLogged isWaitingUser={isWaitingUser} user={user}>
                  <Account setUser={setUser} />
                </IsNotLogged>
              </Route>
              <Route path="/chats/:id">
                <AuthWall>
                  <Chat user={user}/>
                </AuthWall>
              </Route>
              <Route path="/chats">
                <AuthWall>
                  <PersonalChats />
                </AuthWall>
              </Route>
              <Route path="/users">
                <IsLogged isWaitingUser={isWaitingUser} user={user} >
                  <UsersSearch />
                </IsLogged>
                <IsNotLogged isWaitingUser={isWaitingUser} user={user}>
                </IsNotLogged>
              </Route>
              <Route path="/">
                <Home />
              </Route>
            </Switch>
          </div>
          <div className="flex-row justify-content-center">
            <Footer />
          </div>
        </div>
      </div>
    </Router >
  )
}

export default App
