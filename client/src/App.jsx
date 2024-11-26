import { useCallback } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

import './App.css'

import '@/styles/style.css'
import '@/styles/colors.css'
import '@/styles/editor.css'

import { AuthWall } from '@/components/Commons/AuthWalls'
import { IsLogged, IsNotLogged } from '@/components/Commons/Barriers'

import { Nav } from '@/components/UI/Nav/Nav'
import { PushContainer } from '@/components/UI/Push/Push'
import { WebSocketProvider } from '@/components/Ws/WsContext'

import { About } from '@/pages/About/About'
import { Account } from '@/pages/Account/Account'
import { Home } from '@/pages/Home/Home'
import { UsersSearch } from '@/pages/Users/Users'
import { PersonalChats } from '@/pages/Chats/Chats'
import { ChatPage } from '@/pages/Chats/Chat'
import { NewChatEditor } from '@/pages/Chats/ChatEditor'
import { NotFound } from '@/pages/NotFound/NotFound'
import { Settings } from '@/pages/Settings/Settings'

import { useAuth } from '@/hooks'

import usersAPI from '@/api/userAPI'

function MainContainer({ children }) {
  return <div className="main-container">{children}</div>
}

function BodyContainer({ children }) {
  return <div className='d-flex flex-column max-w-body-container flex-grow-1 adaptive-p mt-4-r'>
    {children}
  </div>
}

function App() {
  const getCurrentUserApi = useCallback(() => usersAPI.getCurrentUser().then(res => res.json()), [])
  const auth = useAuth(getCurrentUserApi)
  const { user, isLoading, setUser } = auth

  return <MainContainer>
    <Router>
      <WebSocketProvider user={user}>
        <PushContainer />
        <Nav isWaitingUser={isLoading} user={user} setUser={setUser} />
        <BodyContainer>
          <Routes>
            <Route path="/about" element={<About />} />
            <Route path="/account" element={<>
              <IsNotLogged isWaitingUser={isLoading} user={user}><Account setUser={setUser} /> </IsNotLogged>
              <IsLogged isWaitingUser={isLoading} user={user}><Navigate to="/" /></IsLogged>
            </>} />
            <Route path="/chats/new" element={<AuthWall {...auth}><NewChatEditor user={user} /></AuthWall>} />
            <Route path="/chats/:id" element={<AuthWall {...auth}><ChatPage user={user} /></AuthWall>} />
            <Route path="/chats" element={<AuthWall {...auth}><PersonalChats /></AuthWall>} />
            <Route path="/people" element={<AuthWall {...auth}><UsersSearch user={user} /></AuthWall>} />
            <Route path="/settings" element={<AuthWall {...auth}><Settings user={user} setUser={setUser} /></AuthWall>} />
            <Route exact path="/" element={<Home />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BodyContainer>
      </WebSocketProvider>
    </Router>
  </MainContainer>
}

export default App
