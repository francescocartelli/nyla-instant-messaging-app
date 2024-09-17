import { useCallback } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"

import './App.css'

import 'styles/style.css'
import 'styles/colors.css'

import { AuthWall } from 'components/Common/AuthWalls'
import { IsLogged, IsNotLogged } from 'components/Common/Barriers'

import { Footer } from 'components/UI/Footer/Footer'
import { Nav } from 'components/UI/Nav/Nav'
import { PushContainer } from 'components/UI/Push/Push'
import { WebSocketProvider } from 'components/Ws/WsContext'

import { About } from 'components/Pages/About/About'
import { Account } from './components/Pages/Account/Account'
import { Home } from 'components/Pages/Home/Home'
import { UsersSearch } from 'components/Pages/Users/Users'
import { PersonalChats } from 'components/Pages/Chats/Chats'
import { ChatPage } from 'components/Pages/Chats/Chat'
import { NewChatEditor } from 'components/Pages/Chats/ChatEditor'
import { NotFound } from 'components/Pages/NotFound/NotFound'
import { Settings } from 'components/Pages/Settings/Settings'

import { useAuth } from 'hooks/useAuth'

import usersAPI from 'api/userAPI'

function App() {
  const getCurrentUserApi = useCallback(() => usersAPI.getCurrentUser().then(res => res.json()), [])
  const auth = useAuth(getCurrentUserApi)
  const { user, isLoading, setUser } = auth

  return (
    <div className="App">
      <Router>
        <WebSocketProvider user={user}>
          <div className="main-container">
            <PushContainer />
            <Nav isWaitingUser={isLoading} user={user} setUser={setUser} />
            <div className='mt-nav'><p>-</p></div>
            <div className='d-flex flex-column align-items-center flex-grow-1 adaptive-p pt-2'>
              <Routes>
                <Route path="/about" element={<About />} />
                <Route path="/account" element={<>
                  <IsNotLogged isWaitingUser={isLoading} user={user}><Account setUser={setUser} /> </IsNotLogged>
                  <IsLogged isWaitingUser={isLoading} user={user}><Navigate to="/" /></IsLogged>
                </>} />
                <Route path="/chats/new" element={<AuthWall {...auth}><NewChatEditor user={user} /></AuthWall>} />
                <Route path="/chats/:id" element={<AuthWall {...auth}><ChatPage user={user} /></AuthWall>} />
                <Route path="/chats" element={<AuthWall {...auth}><PersonalChats /></AuthWall>} />
                <Route path="/users" element={<AuthWall {...auth}><UsersSearch user={user} /></AuthWall>} />
                <Route path="/settings" element={<AuthWall {...auth}><Settings user={user} setUser={setUser} /></AuthWall>} />
                <Route exact path="/" element={<Home />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <div className="flex-row justify-content-center hide-small gap-2">
              <Footer />
            </div>
          </div>
        </WebSocketProvider>
      </Router>
    </div>
  )
}

export default App
