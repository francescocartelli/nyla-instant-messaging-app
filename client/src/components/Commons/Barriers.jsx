const IsLogged = ({ isWaitingUser, user, children = <></> }) => {
    return isWaitingUser ? <></> : (user ? children : <></>)
}

const IsNotLogged = ({ isWaitingUser, user, children = <></> }) => {
    return isWaitingUser ? <></> : (!user ? children : <></>)
}

export { IsLogged, IsNotLogged }