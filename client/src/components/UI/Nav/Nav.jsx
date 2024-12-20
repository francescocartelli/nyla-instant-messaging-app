import { useCallback, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { BoxArrowInRight, BoxArrowRight, Chat, ChatFill, ChevronDown, ChevronUp, Gear, GearFill, Hourglass, InfoCircle, InfoCircleFill, List, People, PeopleFill, XCircleFill } from 'react-bootstrap-icons'

import './Nav.css'

import { IsLogged, IsNotLogged } from '@/components/Commons/Barriers'
import { Footer } from '../Footer/Footer'
import { Logo, LogoGrad } from '@/components/Icons/Icons'
import { StatusLayout } from '@/components/Commons/Layout'

import { useStatus } from '@/hooks'

import userAPI from '@/api/userAPI'

function FlexGrow() {
    return <div className="hide-small flex-grow-1"></div>
}

function SepLine() {
    return <div className="show-small b-bottom"></div>
}

function NavItem({ children, selectedChildren, defaultChildren, className = "", to = "#", exactPath = false, ...props }) {
    const location = useLocation()
    const isSelected = exactPath ? location?.pathname === to : location?.pathname.startsWith(to)
    const child = useMemo(() => selectedChildren && defaultChildren ? (isSelected ? selectedChildren : defaultChildren) : children, [isSelected, children, selectedChildren, defaultChildren])

    return <li role='none'>
        <Link {...props} to={to} className={`nav-item ${isSelected ? "active" : ""} ${className}`} role='menuitem'>{child}</ Link>
    </li>
}

function AccountNavItem({ logout, onClickDefaultNavItems, username }) {
    const [isAccountMenuVisible, setAccountMenuVisible] = useState(false)
    const [logoutStatus, logoutStatusActions] = useStatus({ isReady: true })

    const onClickLogout = () => logout(
        () => logoutStatusActions.setLoading(),
        () => { },
        () => logoutStatusActions.setError()
    )

    const onFocus = () => setAccountMenuVisible(p => !p)
    const onBlur = ev => {
        if (!ev.currentTarget.contains(ev.relatedTarget)) {
            setAccountMenuVisible(false)
            onClickDefaultNavItems()
        }
        ev.stopPropagation()
    }

    return <>
        <StatusLayout status={logoutStatus}
            loading={<NavItem to="#"><Hourglass /></NavItem>}
            ready={
                <li role='none' onBlur={onBlur} className='position-relative'>
                    <button role='menuitem' aria-expanded={isAccountMenuVisible} aria-controls='navbar-profile-menu' className='nav-item transparent-button hide-small' onClick={onFocus}>
                        <span className="fore-2">{username}</span>
                        {isAccountMenuVisible ? <ChevronUp /> : <ChevronDown />}
                    </button>
                    {<ul role='menu' className={`position-absolute-large card-2 nav-item-options gap-2 no-ul-style ${isAccountMenuVisible ? 'hide-large' : 'show-small'}`}>
                        <NavItem to='/settings'
                            onClick={onClickDefaultNavItems}
                            defaultChildren={<><Gear /><span >Settings</span></>}
                            selectedChildren={<><GearFill /><span >Settings</span></>} autoFocus={true} />
                        <li role='none'>
                            <button onClick={onClickLogout} role='menuitem' className='nav-item transparent-button'><BoxArrowRight /><span>Logout</span></button>
                        </li>
                    </ul>}
                </li>
            }
        />
    </>
}

function Nav({ isWaitingUser, user, setUser }) {
    const [isCollapsed, setCollapsed] = useState(true)

    const onClickDefaultNavItems = () => setCollapsed(true)

    const logout = useCallback((pendingCallback, fullFillCallback, rejectCallback) => {
        pendingCallback()
        userAPI.logout()
            .then(() => {
                setUser(false)
                fullFillCallback()
            })
            .catch(rejectCallback)
    }, [setUser])

    const onBlur = ev => {
        if (!ev.currentTarget.contains(ev.relatedTarget)) onClickDefaultNavItems()
        ev.stopPropagation()
    }

    return <nav className="d-flex flex-column align-items-center navbar-position back-2 b-bottom">
        <div className="d-flex flex-column justify-content-center align-items-stretch gap-2 max-w-body-container adaptive-p" >
            <ul role='menubar' className="show-small flex-row justify-content-between align-items-center no-ul-style">
                <NavItem to="/" exactPath={true} className="pt-0 pb-0" onClick={onClickDefaultNavItems}>
                    <LogoGrad className="size-1" />
                </NavItem>
                <NavItem to="#" onClick={() => setCollapsed(p => !p)}>
                    {isCollapsed ? <List /> : <XCircleFill />}
                </NavItem>
            </ul>
            <ul role='menubar' className={`${isCollapsed ? "hide-small" : "d-flex"} flex-row-col-adaptive gap-3-adaptive no-ul-style`} onBlur={onBlur}>
                <SepLine />
                <NavItem to={"/"} exactPath={true} className="hide-small p-0" onClick={onClickDefaultNavItems}>
                    <Logo className="size-1" /><span><b>nyla</b></span>
                </NavItem>
                <IsLogged isWaitingUser={isWaitingUser} user={user}>
                    <NavItem to={"/chats"} onClick={onClickDefaultNavItems}
                        defaultChildren={<><Chat /> <span>Chats</span></>}
                        selectedChildren={<><ChatFill /> <span>Chats</span></>} />
                </IsLogged>
                <IsLogged isWaitingUser={isWaitingUser} user={user}>
                    <NavItem to={"/people"} onClick={onClickDefaultNavItems}
                        defaultChildren={<><People /> <span>People</span></>}
                        selectedChildren={<><PeopleFill /> <span>People</span></>} />
                </IsLogged>
                <NavItem to={"/about"} onClick={onClickDefaultNavItems}
                    defaultChildren={<><InfoCircle /> <span>About</span></>}
                    selectedChildren={<><InfoCircleFill /> <span>About</span></>} />
                <FlexGrow />
                <IsLogged isWaitingUser={isWaitingUser} user={user}>
                    <AccountNavItem logout={logout} username={user?.username} onClickDefaultNavItems={onClickDefaultNavItems} />
                </IsLogged>
                <IsNotLogged isWaitingUser={isWaitingUser} user={user}>
                    <FlexGrow />
                    <NavItem to={"/account"} onClick={onClickDefaultNavItems}>
                        <BoxArrowInRight /> <span>Login</span>
                    </NavItem>
                </IsNotLogged>
                <SepLine />
                <div className="show-small row justify-content-center"><Footer /></div>
            </ul>
        </div>
    </nav>
}

export { Nav }