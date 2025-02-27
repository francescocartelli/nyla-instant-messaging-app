import { useCallback, useMemo, useState } from 'react'
import { BoxArrowInRight, PersonPlusFill } from 'react-bootstrap-icons'
import { Link, useNavigate } from 'react-router-dom'

import { useStatus, useValidation } from '@/hooks'

import { ErrorAlert, LoadingAlert } from '@/components/Commons/Alerts'
import { Button } from '@/components/Commons/Buttons'
import { StatusLayout, TabsLayout } from '@/components/Commons/Layout'

import { Logo } from '@/components/Icons'

import { EmailInput, EmailRegistration, GoogleSignInLink, PasswordInput, PasswordRegistration, RepeatPassword, UsernameRegistration } from '@/components/Account/Account'

import { googleAuthenticateEndpoint } from '@/api/endpoints'
import userAPI from '@/api/userAPI'

import useCheckUsernameValidation from './useCheckUsernameValidation'

import './Account.css'

const usernameReg = /^(?=[a-zA-Z0-9._]{8,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/
const emailReg = /^\S+@\S+\.\S+$/
const passwordReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z0-9@$!%*?&]{8,}$/

function LoginTab({ signinSuccessful }) {
    const [userIdentifier, setUserIdentifier] = useState('')
    const [password, setPassword] = useState('')

    const [message, setMessage] = useState('')
    const [loginStatus, loginStatusActions] = useStatus({ isReady: true })

    const onSubmit = ev => {
        ev.preventDefault()
        loginStatusActions.setLoading()
        userAPI.signin(userIdentifier, password).then(res => res.json())
            .then(res => signinSuccessful(res))
            .catch(err => { err.json().then(err => setMessage(err.message)) })
            .finally(loginStatusActions.setReady)
    }

    const isLoginButtonDisabled = useMemo(() => !userIdentifier || !password, [userIdentifier, password])

    return <form className="d-flex align-self-stretch flex-column gap-3" onSubmit={onSubmit}>
        {message && <div className="card-1 warning fs-80 p-2"><span><i>{message}</i></span></div>}
        <div className="d-flex flex-column gap-2">
            <EmailInput value={userIdentifier} onChange={ev => setUserIdentifier(ev.target.value)} />
            <PasswordInput value={password} onChange={ ev => setPassword(ev.target.value)} />
        </div>
        <StatusLayout status={loginStatus}
            loading={<LoadingAlert />}
            ready={<div className="d-flex align-self-stretch"><Button className="flex-grow-1" type="submit" disabled={isLoginButtonDisabled}>Login</Button></div>}
            error={<ErrorAlert />}
        />
        <p className="align-self-center fore-2 fs-80">
            <i>You forgot your <Link to="/login/forgot/username"><u>username</u></Link> or <Link to="/login/forgot"><u>password</u></Link>?</i>
        </p>
    </form>
}

function RegistrationTab({ signupSuccessful }) {
    const onCheckUsername = useCallback(u => userAPI.getUsers(u, 'exact').then(res => res.json()), [])

    const username = useCheckUsernameValidation('', value => usernameReg.test(value), onCheckUsername, 2000)
    const email = useValidation('', value => emailReg.test(value))
    const password = useValidation('', value => passwordReg.test(value))
    const passwordRepeat = useValidation('', value => value === password.value)

    const [message, setMessage] = useState('')
    const [registrationStatus, registrationStatusActions] = useStatus({ isReady: true })

    const onRegister = ev => {
        ev.preventDefault()
        registrationStatusActions.setLoading()
        userAPI.signup(username.value, password.value, email.value).then(res => res.json())
            .then(signupSuccessful)
            .catch(err => { err.json().then(err => setMessage(err.message)) })
            .finally(registrationStatus.setReady)
    }

    const isSubmitDisabled = useMemo(() => username.isInvalid || username.isTaken || password.isInvalid || passwordRepeat.isInvalid || email.isInvalid, [username, password, passwordRepeat, email])

    return <form className="d-flex flex-column align-self-stretch gap-3" onSubmit={onRegister}>
        {message && <div className="card-1 warning fs-80 p-2"><span><i>{message}</i></span></div>}
        <div className="d-flex flex-column gap-2">
            <UsernameRegistration value={username.value} onChange={ev => username.setValue(ev.target.value)} isTaken={username.isTaken} checkStatus={username.checkStatus} isInvalid={username.isInvalid} />
            <EmailRegistration value={email.value} onChange={ev => email.setValue(ev.target.value)} isInvalid={email.isInvalid} />
            <PasswordRegistration value={password.value} onChange={ev => password.setValue(ev.target.value)} isInvalid={password.isInvalid} />
            <RepeatPassword value={passwordRepeat.value} onChange={ev => passwordRepeat.setValue(ev.target.value)} isInvalid={passwordRepeat.isInvalid} />
        </div>
        <StatusLayout status={registrationStatus}
            loading={<LoadingAlert />}
            ready={<div className="d-flex align-self-stretch">
                <Button type="submit" className="flex-grow-1" disabled={isSubmitDisabled}>Register</Button>
            </div>}
            error={<ErrorAlert />}
        />
    </form>
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