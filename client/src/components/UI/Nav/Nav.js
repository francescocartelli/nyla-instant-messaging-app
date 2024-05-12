import { useMemo, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { BoxArrowInRight, BoxArrowRight, Chat, ChatFill, ChevronDown, ChevronUp, Gear, GearFill, Hourglass, InfoCircle, InfoCircleFill, List, People, PeopleFill, XCircleFill } from "react-bootstrap-icons"

import "./Nav.css"

import { IsLogged, IsNotLogged } from "components/Common/Barriers"
import { Footer } from "../Footer/Footer"
import { Logo, LogoGrad } from "components/Icons/Icons"
import { useStatus } from "hooks"
import { StatusLayout } from "components/Common/Layout"

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

function AccountNavItem({ logout, logoutCallback, onClickDefaultNavItems, username }) {
    const [isAccountMenuVisible, setAccountMenuVisible] = useState(false)
    const [logoutStatus, logoutStatusActions] = useStatus("ready")

    const onClickLogout = () => {
        onClickAccountNavItems()
        logoutStatusActions.setLoading()
        logout().then(() => {
            logoutCallback()
        }).catch(err => logoutStatusActions.setError())
    }

    const onClickAccountNavItems = () => { setAccountMenuVisible(false); onClickDefaultNavItems() }

    return <>
        <StatusLayout status={logoutStatus}>
            <loading><NavItem to="#" onClick={() => { }}><Hourglass /></NavItem></loading>
            <ready><NavItem className="position-relative" to="#" onClick={() => setAccountMenuVisible(p => !p)}>
                <span className="fore-2">{username}</span>
                {isAccountMenuVisible ? <ChevronUp /> : <ChevronDown />}
            </NavItem>
            </ready>
            <error></error>
        </StatusLayout>
        {isAccountMenuVisible && <div className="card-2 nav-item-options gap-2">
            <NavItem to="/settings" onClick={onClickAccountNavItems}>
                <default><Gear /> <span>Settings</span></default>
                <selected><GearFill /> <span>Settings</span></selected>
            </NavItem>
            <NavItem>
                <BoxArrowRight /> <span onClick={onClickLogout}>Logout</span>
            </NavItem>
        </div>}
    </>
}

function Nav({ isWaitingUser, user, setUser, logout }) {
    const [isCollapsed, setCollapsed] = useState(true)

    const onClickDefaultNavItems = () => setCollapsed(true)

    return <nav className="d-flex flex-column align-items-stretch navbar adaptive-p gap-2 back-2 b-bottom">
        <div className="show-small flex-row justify-content-between align-items-center">
            <NavItem to="/" exactPath={true} className="pt-0 pb-0" onClick={onClickDefaultNavItems}>
                <LogoGrad className="size-1" />
            </NavItem>
            <NavItem to="#" onClick={() => setCollapsed(p => !p)}>
                {isCollapsed ? <List /> : <XCircleFill />}
            </NavItem>
        </div>
        <div className={`${isCollapsed ? "hide-small" : "d-flex"} flex-row-col-adaptive gap-3-adaptive`}>
            <SepLine />
            <NavItem to={"/"} exactPath={true} className="hide-small pt-0 pb-0" onClick={onClickDefaultNavItems}>
                <Logo className="size-1" /><span><b>nyla</b></span>
            </NavItem>
            <NavItem to={"/about"} onClick={onClickDefaultNavItems}>
                <default><InfoCircle /> <span>About</span></default>
                <selected><InfoCircleFill /> <span>About</span></selected>
            </NavItem>
            <IsLogged isWaitingUser={isWaitingUser} user={user}>
                <NavItem to={"/chats"} onClick={onClickDefaultNavItems}>
                    <default><Chat /> <span>Chats</span></default>
                    <selected><ChatFill /> <span>Chats</span></selected>
                </NavItem>
                <NavItem to={"/users"} onClick={onClickDefaultNavItems}>
                    <default><People /> <span>Users</span></default>
                    <selected><PeopleFill /> <span>Users</span></selected>
                </NavItem>
                <FlexGrow />
                <AccountNavItem logout={logout} username={user?.username}
                    onClickDefaultNavItems={onClickDefaultNavItems}
                    logoutCallback={() => setUser(false)} />
            </IsLogged>
            <IsNotLogged isWaitingUser={isWaitingUser} user={user}>
                <FlexGrow />
                <NavItem to={"/account"} onClick={onClickDefaultNavItems}>
                    <BoxArrowInRight /> <span>Login</span>
                </NavItem>
            </IsNotLogged>
            <SepLine />
            <div className="show-small row justify-content-center"><Footer /></div>
        </div>
    </nav>
}

export { Nav }