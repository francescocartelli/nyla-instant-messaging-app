import { Navigate } from 'react-router-dom'

const AuthWall = ({ user, isLoading, children }) => {
    // if the app refresh user won't be present when auth wall is evaluated
    // checking for isWaitingUser avoid displaying a login page even tough use has valid token
    // in case of logged user and missing user check the app will display login to later discard the page (not good)
    if (isLoading) return <></>
    if (!user) return <Navigate to="/account" />
    return children
}

export { AuthWall }