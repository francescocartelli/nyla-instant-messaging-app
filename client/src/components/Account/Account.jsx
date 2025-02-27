import { useMemo, useState } from 'react'
import { Check2, EnvelopeFill, EyeFill, EyeSlashFill, Hourglass, Lock, LockFill, PersonFill, XCircle } from 'react-bootstrap-icons'

import { Text, TextVal } from '@/components/Commons/Inputs'
import { StatusLayout } from '@/components/Commons/Layout'

import { GoogleColored } from '@/components/Icons'

function UsernameRegistration({ value, isInvalid, isTaken, checkStatus, ...props }) {
    const isAlertVisible = useMemo(() => !isInvalid && value, [value, isInvalid])

    return <>
        <TextVal autoComplete="new-password" placeholder="Username..." value={value} isInvalid={isInvalid} left={<PersonFill className="fore-2 size-1" />}
            message={<>
                <span><b>Required username pattern:</b></span>
                <span>Between 8 and 20 characters are required.</span>
            </>} {...props} />
        {isAlertVisible && <div className="card-1 d-flex flex-row gap-2 align-items-center">
            <StatusLayout status={checkStatus}
                loading={<><span className="fore-2 fs-80 flex-grow-1">Checking username uniqueness...</span> <Hourglass className="size-1 fore-2" /></>}
                ready={isTaken ?
                    <><span className="fore-2 fs-80 flex-grow-1">Username is already taken.</span> <XCircle className="size-1 fore-danger" /></> :
                    <><span className="fore-2 fs-80 flex-grow-1">Username is unique.</span> <Check2 className="size-1 fore-success" /></>} />
        </div>}
    </>
}

function PasswordRegistration(props) {
    return <TextVal {...props} autoComplete="new-password" type="password" placeholder="Password..."
        left={<LockFill className="fore-2 size-1" />} message={
            <>
                <span><b>Required password pattern:</b></span>
                <span>At least 1 lowercase character is required.</span>
                <span>At least 1 uppercase character is required.</span>
                <span>At least 1 special character is required.</span>
                <span>At least 1 number is required.</span>
            </>
        } />
}

function RepeatPassword(props) {
    return <TextVal {...props} autoComplete="new-password" type="password" placeholder="Repeat password..."
        left={<Lock className="fore-2 size-1" />} message={
            <>
                <span><b>Required repeat password rule:</b></span>
                <span>Passwords should match.</span>
            </>
        } />
}

function EmailRegistration(props) {
    return <TextVal {...props} autoComplete="new-password" placeholder="Email..."
        left={<EnvelopeFill className="fore-2 size-1" />} message={
            <>
                <span><b>Required email pattern:</b></span>
                <span>Provide a valid email address.</span>
            </>
        } />
}

function GoogleSignInLink({ className, ...props }) {
    return <a className={`google-sign-in-link ${className}`} {...props}>
        <GoogleColored /> <span className="fore-1">Sign in with Google</span>
    </a>
}

function EmailInput(props) {
    return <Text autoComplete="new-password"  placeholder="Username or email..." left={<PersonFill className="fore-2 size-1" />} {...props}/>
}

function PasswordInput(props) {
    const [isShowPassword, setShowPassword] = useState(false)

    const passwordType = useMemo(() => isShowPassword ? "text" : "password", [isShowPassword])

    return <Text autoComplete="new-password" type={passwordType} placeholder="Password..."  left={<LockFill className="fore-2 size-1" />}
    right={isShowPassword ?
        <EyeFill className="fore-2-btn size-1" onClick={() => setShowPassword(false)} /> :
        <EyeSlashFill className="fore-2-btn size-1" onClick={() => setShowPassword(true)} />
    } {...props}/>
}

export { EmailRegistration, GoogleSignInLink, PasswordRegistration, RepeatPassword, UsernameRegistration, EmailInput, PasswordInput }
