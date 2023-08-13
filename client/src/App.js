import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"

import './App.css'

import 'styles/style.css'
import 'styles/colors.css'

import { IsNotLogged } from 'components/Common/Barriers'

import { Footer } from 'components/UI/Footer/Footer'
import { Nav } from 'components/UI/Nav/Nav'
import { PushContainer } from 'components/UI/Push/Push'
import { WebSocketProvider } from 'components/Ws/WsContext'

import { About } from 'components/Pages/About/About'
import { Account } from './components/Pages/Account/Account'
import { Home } from 'components/Pages/Home/Home'
import { UsersSearch } from 'components/Pages/Users/Users'
import { PersonalChats } from 'components/Pages/Chats/Chats'
import { Chat } from 'components/Pages/Chats/Chat'
import { NewChatEditor } from 'components/Pages/Chats/ChatEditor'

import usersAPI from 'api/userAPI'

function App() {
  const [user, setUser] = useState(false)
  const [isWaitingUser, setWaitingUser] = useState(true)
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    usersAPI.getCurrentUser().then((user) => {
      setUser(user)
      setWaitingUser(false)
    }).catch((err) => {
      setUser(false)
      setWaitingUser(false)
    })

    return () => setUser(false)
  }, [])

  const AuthWall = ({ children }) => {
    // if the app refresh user won't be present when auth wall is evaluated
    // checking for isWaitingUser avoid displaying a login page even tough use has valid token
    // in case of logged user and missing user check the app will display login to later discard the page (not good)
    if (isWaitingUser) return <></>
    if (!user) return <Navigate to="/account" />
    return children
  }

  return (
    <Router>
      <div className="App">
        <WebSocketProvider user={user}>
          <div className="main-container">
            <PushContainer notifications={notifications} setNotifications={setNotifications} />
            <Nav isWaitingUser={isWaitingUser} user={user} setUser={setUser} logout={() => usersAPI.logout()} />
            <div className='mt-nav'><p>-</p></div>
            <div className='d-flex flex-column align-items-center flex-grow-1 adaptive-p'>
              <Routes>
                <Route path="/about" element={<About />} />
                <Route path="/account" element={<IsNotLogged isWaitingUser={isWaitingUser} user={user}>
                  <Account setUser={setUser} />
                </IsNotLogged>} />
                <Route path="/chats/new" element={<AuthWall>
                  <NewChatEditor user={user} />
                </AuthWall>} />
                <Route path="/chats/:id" element={<AuthWall>
                  <Chat user={user} />
                </AuthWall>} />
                <Route path="/chats" element={<AuthWall>
                  <PersonalChats />
                </AuthWall>} />
                <Route path="/users" element={<AuthWall>
                  <UsersSearch user={user} />
                </AuthWall>} />
                <Route path="/" element={<Home />} />
              </Routes>
            </div>
            <div className="flex-row justify-content-center hide-small gap-2">
              <Footer />
            </div>
          </div>
        </WebSocketProvider>
      </div>
    </Router >
  )
}

export default App
