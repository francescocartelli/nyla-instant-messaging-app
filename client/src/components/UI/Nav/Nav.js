import { useState } from 'react'
import { Link } from "react-router-dom"
import { BoxArrowRight, ChatFill, InfoCircle, List, PersonFill, XCircleFill } from 'react-bootstrap-icons'

import './Nav.css'

import { IsLogged, IsNotLogged } from 'components/Common/Barriers'
import { Footer } from '../Footer/Footer'
import { Logo, LogoGrad } from 'components/Icons/Icons'

function Sep() {
    return <div className='hide-small flex-grow-1'></div>
}

function Nav({ isWaitingUser, user, setUser, logout }) {
    const [isCollapsed, setCollapsed] = useState(true)

    function NavItem({ className, children, onClick, ...props }) {
        const defaultBehaviorOnClick = () => setCollapsed(true)

        return <Link {...props} className={`nav-item ${className}`} onClick={onClick ? onClick : defaultBehaviorOnClick}>
            {children}
        </Link>
    }

    return <div className="d-flex flex-column align-items-stretch navbar adaptive-p gap-2 back-2">
        <div className='show-small flex-row justify-content-between align-items-center'>
            <NavItem to='/' className="pt-0 pb-0"><LogoGrad className="size-1" /></NavItem>
            <NavItem to='#' onClick={() => setCollapsed(p => !p)}>{isCollapsed ? <List className='fore-2'/> : <XCircleFill className='fore-2'/>}</NavItem>
        </div>
        <div className={`${isCollapsed ? "hide-small" : "d-flex"} flex-row-col-adaptive gap-3`}>
            <NavItem to={"/"} className="hide-small pt-0 pb-0"><Logo className="size-1" /><span><b>nyla</b></span></NavItem>
            <NavItem to={"/about"}><InfoCircle className='fore-2' /><span>About</span></NavItem>
            <IsLogged isWaitingUser={isWaitingUser} user={user}>
                <NavItem to={"/chats"}><ChatFill className='fore-2' /><span>Chats</span></NavItem>
                <NavItem to={"/users"}><PersonFill className='fore-2' /><span>Users</span></NavItem>
                <Sep />
                <NavItem to='#' className="border" onClick={() => {
                    logout().then(() => { setUser(false) }).catch(err => console.log(err))
                }}><BoxArrowRight className='fore-2' /> <span>Logout</span></NavItem>
            </IsLogged>
            <IsNotLogged isWaitingUser={isWaitingUser} user={user}>
                <Sep />
                <NavItem to={"/account"} className="card-2"><span>Login</span></NavItem>
            </IsNotLogged>
            <div className='show-small row justify-content-center'><Footer /></div>
        </div>
    </div>
}

export { Nav }