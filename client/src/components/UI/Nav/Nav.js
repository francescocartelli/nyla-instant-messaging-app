import { useState } from 'react'
import { Link, useLocation } from "react-router-dom"
import { BoxArrowInRight, BoxArrowRight, ChatFill, Gear, InfoCircle, List, PersonFill, XCircleFill } from 'react-bootstrap-icons'

import './Nav.css'

import { IsLogged, IsNotLogged } from 'components/Common/Barriers'
import { Footer } from '../Footer/Footer'
import { Logo, LogoGrad } from 'components/Icons/Icons'

function Sep() {
    return <div className='hide-small flex-grow-1'></div>
}

function Nav({ isWaitingUser, user, setUser, logout }) {
    const [isCollapsed, setCollapsed] = useState(true)

    const onClickLogout = () => logout().then(() => { setUser(false) }).catch(err => console.log(err))

    function NavItem({ children, onClick, className = "", to = '#', exactPath = false, ...props }) {
        const location = useLocation()

        const defaultBehaviorOnClick = () => setCollapsed(true)
        const selected = exactPath ? location?.pathname === to : location?.pathname.startsWith(to)

        return <Link {...props} to={to}
            onClick={onClick ? onClick : defaultBehaviorOnClick}
            className={`nav-item ${selected ? "active" : ""} ${className}`}>
            {children}
        </ Link>
    }

    return <div className="d-flex flex-column align-items-stretch navbar adaptive-p gap-2 back-2 b-bottom">
        <div className='show-small flex-row justify-content-between align-items-center'>
            <NavItem to='/' exactPath={true} className="pt-0 pb-0"><LogoGrad className="size-1" /></NavItem>
            <NavItem to='#' onClick={() => setCollapsed(p => !p)}>{isCollapsed ? <List /> : <XCircleFill />}</NavItem>
        </div>
        <div className={`${isCollapsed ? "hide-small" : "d-flex"} flex-row-col-adaptive gap-3-adaptive`}>
            <div className="show-small b-bottom"></div>
            <NavItem to={"/"} exactPath={true} className="hide-small pt-0 pb-0"><Logo className="size-1" /><span><b>nyla</b></span></NavItem>
            <NavItem to={"/about"}><InfoCircle /><span>About</span></NavItem>
            <IsLogged isWaitingUser={isWaitingUser} user={user}>
                <NavItem to={"/chats"}><ChatFill /><span>Chats</span></NavItem>
                <NavItem to={"/users"}><PersonFill /><span>Users</span></NavItem>
                <Sep />
                <NavItem to="/settings"><Gear/> <span>Settings</span></NavItem>
                <NavItem to='#' onClick={onClickLogout}><BoxArrowRight /> <span>Logout</span></NavItem>
            </IsLogged>
            <IsNotLogged isWaitingUser={isWaitingUser} user={user}>
                <Sep />
                <NavItem to={"/account"}><BoxArrowInRight /> <span>Login</span></NavItem>
            </IsNotLogged>
            <div className="show-small b-bottom"></div>
            <div className='show-small row justify-content-center'><Footer /></div>
        </div>
    </div>
}

export { Nav }