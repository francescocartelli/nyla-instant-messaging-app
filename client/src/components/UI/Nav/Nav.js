import { useState } from 'react'
import { Link } from "react-router-dom"
import { List, XCircleFill } from 'react-bootstrap-icons'

import './Nav.css'
import 'styles/style.css'

function NavItem({ className, children, ...props }) {
    return <Link {...props} className={`nav-item ${className}`}>
        {children}
    </Link>
}

function Sep() {
    return <div className='hide-small flex-grow-1'></div>
}

function Nav({ isWaitingUser, user, setUser, logout }) {
    const [isCollapsed, setCollapsed] = useState(true)

    const IsLogged = ({ children }) => {
        return isWaitingUser ? <></> : (user ? children : <></>)
    }

    const IsNotLogged = ({ children }) => {
        return isWaitingUser ? <></> : (!user ? children : <></>)
    }

    return <div className="d-flex flex-column align-items-stretch navbar adaptive-p gap-2 back-2">
        <div className='show-small flex-row justify-content-between align-items-center'>
            <NavItem to='/'>LOGO</NavItem>
            <NavItem to='#' onClick={() => setCollapsed(p => !p)}>{isCollapsed ? <List /> : <XCircleFill />}</NavItem>
        </div>
        <div className={`${isCollapsed ? "hide-small" : "d-flex"} flex-row-col-adaptive gap-2`}>
            <NavItem to={"/"} className="hide-small">LOGO<b>app name</b></NavItem>
            <IsLogged>
                <NavItem to={"/users"}>Users</NavItem>
                <Sep/>
                <NavItem to='#' className="border" onClick={() => {
                    logout().then(() => { setUser(false) }).catch(err => console.log(err))
                }}>Logout</NavItem>
            </IsLogged>
            <IsNotLogged>
                <NavItem to={"/account"}>option #2</NavItem>
                <NavItem to={"/account"}>option #3</NavItem>
                <Sep/>
                <NavItem to={"/account"} className="card-2">Login</NavItem>
            </IsNotLogged>
        </div>
    </div>
}

export { Nav }