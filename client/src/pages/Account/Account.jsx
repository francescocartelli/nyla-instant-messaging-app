import { useState } from 'react'
import { BoxArrowInRight, EyeFill, EyeSlashFill, LockFill, PersonFill, PersonPlusFill } from 'react-bootstrap-icons'
import { Link, useNavigate } from 'react-router-dom'

import { useStatus } from '@/hooks'

import { ErrorAlert, LoadingAlert } from '@/components/Commons/Alerts'
import { Button } from '@/components/Commons/Buttons'
import { Text } from '@/components/Commons/Inputs'
import { StatusLayout, TabsLayout } from '@/components/Commons/Layout'

import { GoogleColored, Logo } from '@/components/Icons/Icons'

import { EmailRegistration, PasswordRegistration, UsernameRegistration } from '@/components/Account/Account'

import userAPI from '@/api/userAPI'

import { googleAuthenticateEndpoint } from '@/api/endpoints'

import './Account.css'

function LoginTab({ signinSuccessful }) {
    const [userIdentifier, setUserIdentifier] = useState("")
    const [password, setPassword] = useState("")
    const [isShowPassword, setShowPassword] = useState(false)
    const [message, setMessage] = useState("")

    const [loginStatus, loginStatusActions] = useStatus({ isReady: true })

    const onSubmit = (ev) => {
        ev.preventDefault()
        loginStatusActions.setLoading()
        userAPI.signin(userIdentifier, password)
            .then(res => res.json())
            .then(res => {
                loginStatusActions.setReady()
                signinSuccessful(res)
            })
            .catch(err => {
                loginStatusActions.setReady()
                err.json()
                    .then(err => setMessage(err.message))
            })

    }

    const onChangeUserIdentifier = ev => setUserIdentifier(ev.target.value)
    const onChangePassword = ev => setPassword(ev.target.value)
    const onShowPassword = ev => setShowPassword(false)
    const onHidePassword = ev => setShowPassword(true)

    const passwordType = isShowPassword ? "text" : "password"
    const isLoginButtonDisabled = !userIdentifier || !password

    return <form className="d-flex align-self-stretch flex-column gap-3" onSubmit={onSubmit}>
        {message && <div className="card-1 warning fs-80 p-2"><span><i>{message}</i></span></div>}
        <div className="d-flex flex-column gap-2">
            <Text autoComplete="new-password" value={userIdentifier} placeholder="Username or email..." onChange={onChangeUserIdentifier} left={<PersonFill className="fore-2 size-1" />} />
            <Text autoComplete="new-password" type={passwordType} placeholder="Password..." value={password} onChange={onChangePassword} left={<LockFill className="fore-2 size-1" />}
                right={isShowPassword ?
                    <EyeFill className="fore-2-btn size-1" onClick={onShowPassword} /> :
                    <EyeSlashFill className="fore-2-btn size-1" onClick={onHidePassword} />
                } />
        </div>
        <StatusLayout status={loginStatus}
            loading={<LoadingAlert />}
            ready={<div className="d-flex align-self-stretch">
                <Button className="flex-grow-1" type="submit" disabled={isLoginButtonDisabled}>Login</Button>
            </div>}
            error={<ErrorAlert />}
        />
        <p className="align-self-center fore-2 fs-80">
            <i>You forgot your <Link to="/login/forgot/username"><u>username</u></Link> or <Link to="/login/forgot"><u>password</u></Link>?</i>
        </p>
    </form>
}

function RegistrationTab({ signupSuccessful }) {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [email, setEMail] = useState("")

    const [isUsernameInvalidOrTaken, setUsernameInvalidOrTaken] = useState(true)
    const [isAnyPasswordInvalid, setAnyPasswordInvalid] = useState(true)
    const [isEmailInvalid, setEmailInvalid] = useState(true)

    const [message, setMessage] = useState("")

    const [registrationStatus, registrationStatusActions] = useStatus({ isReady: true })

    const onRegister = ev => {
        ev.preventDefault()
        registrationStatusActions.setLoading()
        userAPI.signup(username, password, email)
            .then(res => res.json())
            .then(res => {
                registrationStatusActions.setReady()
                signupSuccessful(res)
            })
            .catch(err => {
                registrationStatusActions.setReady()
                err.json()
                    .then(err => setMessage(err.message))
            })

    }

    const isRegisterButtonDisabled = isUsernameInvalidOrTaken || isAnyPasswordInvalid || isEmailInvalid

    return <form className="d-flex flex-column align-self-stretch gap-3" onSubmit={onRegister}>
        {message && <div className="card-1 warning fs-80 p-2"><span><i>{message}</i></span></div>}
        <div className="d-flex flex-column gap-2">
            <UsernameRegistration username={username} setUsername={setUsername} setInvalid={setUsernameInvalidOrTaken} onCheck={userAPI.getUsers} />
            <EmailRegistration email={email} setEMail={setEMail} isEmailInvalid={isEmailInvalid} setEmailInvalid={setEmailInvalid}/>
            <PasswordRegistration password={password} setPassword={setPassword} setInvalid={setAnyPasswordInvalid} />
        </div>
        <StatusLayout status={registrationStatus}
            loading={<LoadingAlert />}
            ready={<div className="d-flex align-self-stretch">
                <Button type="submit" className="flex-grow-1" disabled={isRegisterButtonDisabled}>Register</Button>
            </div>}
            error={<ErrorAlert />}
        />
    </form>
}

function GoogleSignInLink({className, ...props}) {
    return <a className={`google-sign-in-link ${className}`} {...props}>
        <GoogleColored /> <span className="fore-1">Sign in with Google</span>
    </a>
}

function AccountPage({ setUser }) {
    const navigate = useNavigate()

    const onSignSuccess = response => {
        setUser(response)
        navigate("/")
    }

    return <div className="d-flex flex-column align-self-center gap-2 align-items-center flex-grow-1 justify-content-center p-0 max-w-300">
        <div style={{ marginTop: "-5em" }} className="align-self-center"><Logo fontSize={64} /></div>
        <TabsLayout>
            <div title={<>Sign In <BoxArrowInRight className="size-1" /></>}><LoginTab signinSuccessful={onSignSuccess} /></div>
            <div title={<>Sign Up <PersonPlusFill className="size-1" /></>}><RegistrationTab signupSuccessful={onSignSuccess} /></div>
        </TabsLayout>
        <GoogleSignInLink className="mt-4" href={`${import.meta.env.VITE_PROXY_URL}${googleAuthenticateEndpoint()}`} />
    </div>
}

export default AccountPage