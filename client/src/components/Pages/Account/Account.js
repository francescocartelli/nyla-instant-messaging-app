import { useEffect, useState } from 'react'
import { BoxArrowInRight, EnvelopeFill, EyeFill, EyeSlashFill, Lock, LockFill, PersonFill, PersonPlusFill } from 'react-bootstrap-icons'
import { Link, useNavigate } from 'react-router-dom'

import { Logo } from 'components/Icons/Icons'

import { Text } from 'components/Common/Inputs'
import { Button } from 'components/Common/Buttons'
import { TabsLayout } from 'components/Common/Layout'

import usefullRegExp from "utils/UsefullRegExp"
import userAPI from 'api/userAPI'

import "./Account.css"

function LoginTab({ signinSuccessful }) {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [isShowPassword, setShowPassword] = useState(false)
    const [message, setMessage] = useState("")

    return <>
        {message && <div className='alert'><p><i>{message}</i></p></div>}
        <Text autoComplete="new-password" value={username} placeholder="Username or email..." onChange={(ev) => setUsername(ev.target.value)}
            left={<PersonFill className='fore-2 size-1' />} />
        <Text autoComplete="new-password" type={isShowPassword ? "text" : "password"} placeholder="Password..."
            value={password} onChange={(ev) => setPassword(ev.target.value)}
            left={<LockFill className='fore-2 size-1' />}
            right={isShowPassword ?
                <EyeFill className='fore-2-btn size-1' onClick={() => setShowPassword(false)} /> :
                <EyeSlashFill className='fore-2-btn size-1' onClick={() => setShowPassword(true)} />
            } />
        <div className='d-flex align-self-stretch'><Button className="flex-grow-1" onClick={() => {
            userAPI.signin(username, password).then((response) => {
                signinSuccessful(response)
            }).catch((err) => {
                setMessage(err.message)
            })
        }} isDisabled={!username || !password}>Login</Button></div>
        <p className='align-self-center' style={{ color: '#ffffff80', fontSize: '0.8em' }}>
            <i>You forgot your <Link to='/login/forgot/username'>username</Link> or <Link to='/login/forgot'>password</Link>?</i>
        </p>
    </>
}

function RegistrationTab({ signupSuccessful }) {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [passwordRepeat, setRepeatPassword] = useState("")
    const [email, setEMail] = useState("")

    const [messages, setMessages] = useState([])

    useEffect(() => {
        const m = []

        if (username === "" || password === "" || passwordRepeat === "" || passwordRepeat === "") m.push("All fields are required")
        if (username !== "" && !usefullRegExp.usernameReg.test(username)) m.push("Username is not valid")
        if (email !== "" && !usefullRegExp.emailReg.test(email)) m.push("Email is not valid")
        if (password !== "" && !usefullRegExp.passwordReg.test(password)) m.push("Password is not valid")
        if (password !== passwordRepeat) m.push('The passwords do not match')

        setMessages([...m])
    }, [username, password, passwordRepeat, email])

    return <>
        {messages.length > 0 && <div className='d-flex flex-column alert'>
            {messages.map((m, i) => <p key={i}><i>{m}</i></p>)}
        </div>}
        <Text autoComplete="new-password" value={username} placeholder="Username..." onChange={(ev) => { setUsername(ev.target.value) }}
            left={<PersonFill className='fore-2 size-1' />} />
        <Text autoComplete="new-password" value={email} placeholder="Email..." onChange={(ev) => setEMail(ev.target.value)}
            left={<EnvelopeFill className='fore-2 size-1' />} />
        <Text autoComplete="new-password" type="password" placeholder="Password..." value={password} onChange={(ev) => setPassword(ev.target.value)}
            left={<LockFill className='fore-2 size-1' />} />
        <Text autoComplete="new-password" type="password" placeholder="Repeat password..." value={passwordRepeat} onChange={(ev) => setRepeatPassword(ev.target.value)}
            left={<Lock className='fore-2 size-1' />} />
        <div className='d-flex align-self-stretch'><Button className="flex-grow-1" isDisabled={messages.length > 0} onClick={() => {
            userAPI.signup(username, password, email).then((response) => {
                signupSuccessful(response)
            }).catch(err => {
                setMessages(p => [...p, err.message])
            })
        }}>Register</Button></div>
    </>
}

function Account(props) {
    const navigate = useNavigate()

    const signinSuccessful = (response) => {
        props.setUser(response)
        navigate('/')
    }

    const signupSuccessful = (response) => {
        props.setUser(response)
        navigate('/')
    }

    return <div className='d-flex flex-column align-self-center gap-2 align-items-center flex-grow-1 justify-content-center p-0 max-s'>
        <div style={{ marginTop: '-5em' }} className='align-self-center'><Logo fontSize={64} /></div>
        <TabsLayout>
            <div title={<>Sign In <BoxArrowInRight className='size-1' /></>}><LoginTab signinSuccessful={signinSuccessful} /></div>
            <div title={<>Sign Up <PersonPlusFill className='size-1' /></>}><RegistrationTab signupSuccessful={signupSuccessful} /></div>
        </TabsLayout>
    </div >
}

export { Account }