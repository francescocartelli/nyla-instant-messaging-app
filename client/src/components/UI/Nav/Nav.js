import { useMemo, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { BoxArrowInRight, BoxArrowRight, Chat, ChatFill, Gear, GearFill, InfoCircle, InfoCircleFill, List, People, PeopleFill, XCircleFill } from "react-bootstrap-icons"

import "./Nav.css"

import { IsLogged, IsNotLogged } from "components/Common/Barriers"
import { Footer } from "../Footer/Footer"
import { Logo, LogoGrad } from "components/Icons/Icons"

function FlexGrow() {
    return <div className="hide-small flex-grow-1"></div>
}

function SepLine() {
    return <div className="show-small b-bottom"></div>
}

function NavItem({ children, className = "", to = "#", exactPath = false, ...props }) {
    const location = useLocation()

    const selected = exactPath ? location?.pathname === to : location?.pathname.startsWith(to)

    const child = useMemo(() => {
        const targetType = selected ? "selected" : "default"
        const child = children?.find?.(({ type }) => type === targetType)?.props.children
        return child ? child : children
    }, [children, selected])

    return <Link {...props} to={to} className={`nav-item ${selected ? "active" : ""} ${className}`}>{child}</ Link>
}

function Nav({ isWaitingUser, user, setUser, logout }) {
    const [isCollapsed, setCollapsed] = useState(true)

    const onClickDefaultNatItems = () => setCollapsed(true)
    const onClickLogout = () => {
        logout().then(() => setUser(false)).catch(err => console.log(err))
        onClickDefaultNatItems()
    }

    return <div className="d-flex flex-column align-items-stretch navbar adaptive-p gap-2 back-2 b-bottom">
        <div className="show-small flex-row justify-content-between align-items-center">
            <NavItem to="/" exactPath={true} className="pt-0 pb-0" onClick={onClickDefaultNatItems}>
                <LogoGrad className="size-1" />
            </NavItem>
            <NavItem to="#" onClick={() => setCollapsed(p => !p)}>
                {isCollapsed ? <List /> : <XCircleFill />}
            </NavItem>
        </div>
        <div className={`${isCollapsed ? "hide-small" : "d-flex"} flex-row-col-adaptive gap-3-adaptive`}>
            <SepLine />
            <NavItem to={"/"} exactPath={true} className="hide-small pt-0 pb-0" onClick={onClickDefaultNatItems}>
                <Logo className="size-1" /><span><b>nyla</b></span>
            </NavItem>
            <NavItem to={"/about"} onClick={onClickDefaultNatItems}>
                <default><InfoCircle /> <span>About</span></default>
                <selected><InfoCircleFill /> <span>About</span></selected>
            </NavItem>
            <IsLogged isWaitingUser={isWaitingUser} user={user}>
                <NavItem to={"/chats"} onClick={onClickDefaultNatItems}>
                    <default><Chat /> <span>Chats</span></default>
                    <selected><ChatFill /> <span>Chats</span></selected>
                </NavItem>
                <NavItem to={"/users"} onClick={onClickDefaultNatItems}>
                    <default><People /> <span>Users</span></default>
                    <selected><PeopleFill /> <span>Users</span></selected>
                </NavItem>
                <FlexGrow />
                <NavItem to="/settings" onClick={onClickDefaultNatItems}>
                    <default><Gear /> <span>Settings</span></default>
                    <selected><GearFill /> <span>Settings</span></selected>
                </NavItem>
                <NavItem to="#" onClick={onClickLogout}>
                    <BoxArrowRight /> <span>Logout</span>
                </NavItem>
            </IsLogged>
            <IsNotLogged isWaitingUser={isWaitingUser} user={user}>
                <FlexGrow />
                <NavItem to={"/account"} onClick={onClickDefaultNatItems}>
                    <BoxArrowInRight /> <span>Login</span>
                </NavItem>
            </IsNotLogged>
            <SepLine />
            <div className="show-small row justify-content-center"><Footer /></div>
        </div>
    </div>
}

export { Nav }