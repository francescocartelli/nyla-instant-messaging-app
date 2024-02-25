import { useState } from "react"
import { Check2, Hourglass, Pencil, XCircle } from "react-bootstrap-icons"

import { Button } from "components/Common/Buttons"
import { Text } from "components/Common/Inputs"
import { useStatus } from "hooks"
import { StatusLayout } from "components/Common/Layout"
import userAPI from "api/userAPI"
import { PasswordRegistration, UsernameRegistration } from "../Account/Account"

function SettingSection({ children }) {
    return <h3 className="m-0">{children}</h3>
}

function SettingSubSection({ children }) {
    return <h5 className="m-0">{children}</h5>
}

function SettingCard({ onRenderChildren, onConfirm, confirmCallback, initialValue, initialInvalid = false }) {
    const [isEditing, setEditing] = useState(false)
    const [value, setValue] = useState(initialValue)
    const [isInvalid, setInvalid] = useState(initialInvalid)

    const [confirmStatus, confirmStatusActions] = useStatus("ready")

    const onClickConfirm = (ev) => {
        ev.preventDefault()
        setEditing(false)
        confirmStatusActions.setLoading()
        onConfirm(value).then(() => {
            confirmStatusActions.setReady()
            confirmCallback(value)
        }).catch(err => confirmStatusActions.setError())
    }

    const onClickCancel = () => { setValue(initialValue); setEditing(false) }

    return <div className="d-flex flex-column gap-2">
        <div className="d-flex flex-row gap-2 align-items-center">
            {onRenderChildren(value, setValue, !isEditing, setInvalid)}
            <StatusLayout status={confirmStatus}>
                <loading><Button onClick={() => { }}><Hourglass className="fore-2 size-1" /></Button></loading>
                <ready>{isEditing ? <>
                    <Button disabled={isInvalid} onClick={onClickConfirm}><Check2 className="fore-2 size-1" /></Button>
                    <Button onClick={onClickCancel}><XCircle className="fore-2 size-1" /></Button>
                </> : <Button onClick={() => setEditing(true)}><Pencil className="fore-2 size-1" /></Button>}</ready>
                <error></error>
            </StatusLayout>
        </div>
    </div>
}

function BioSetting({ user, setUser }) {
    return <>
        <SettingSubSection>Bio</SettingSubSection>
        <SettingCard initialValue={user?.bio}
            onConfirm={(value) => userAPI.updateUser(user.id, { bio: value })}
            confirmCallback={(value) => setUser(p => { return { ...p, bio: value } })}
            onRenderChildren={(value, onChange, disabled, setInvalid) =>
                <Text placeholder="Your personal bio..." value={value} onChange={(ev) => onChange(ev.target.value)} disabled={disabled} />} />
        <p className="fore-2 fs-80">Your personal bio will be visible to those viewing your profile informations.</p>
    </>
}

function UsernameSetting({ user, setUser }) {
    return <>
        <SettingSubSection>Username</SettingSubSection>
        <SettingCard initialValue={user?.username} initialInvalid={true}
            onConfirm={(value) => userAPI.updateUser(user.id, { username: value })}
            confirmCallback={(value) => setUser(p => { return { ...p, username: value } })}
            onRenderChildren={(value, onChange, disabled, setInvalid) => <div className="d-flex flex-row flex-grow-1 gap-2">
                <UsernameRegistration username={value} setUsername={onChange} disabled={disabled} setInvalid={setInvalid} />
            </div>}></SettingCard>
        <p className="fore-2 fs-80">Changing your username will affect your sing-in credential.</p>
    </>
}

function EmailSetting() {
    return <>
        <SettingSubSection>EMail</SettingSubSection>
        <SettingCard initialValue="" initialInvalid={true} onConfirm={() => {}} confirmCallback={() => {}}
            onRenderChildren={(value, onChange, disabled, setInvalid) => <div className="d-flex flex-row flex-grow-1 gap-2">
                <Text type="password" value="email is not available" onChange={onChange} disabled={true} />
            </div>}></SettingCard>
        <p className="fore-2 fs-80">This setting is locked.</p>
    </>
}

function PasswordSetting() {
    return <>
        <SettingSubSection>Change Password</SettingSubSection>
        <SettingCard initialValue="" initialInvalid={true} onConfirm={() => {}} confirmCallback={() => {}}
            onRenderChildren={(value, onChange, disabled, setInvalid) => <div className="d-flex flex-row flex-grow-1 gap-2">
                <PasswordRegistration password={value} setPassword={onChange} setInvalid={setInvalid} disabled={disabled}/>
            </div>}></SettingCard>
        <p className="fore-2 fs-80">This setting is locked.</p>
    </>
}

function Settings({ user, setUser }) {
    return <div className="d-flex flex-column flex-grow-1 align-self-stretch gap-2 mt-3 scroll-y h-0">
        <SettingSection>Profile Details</SettingSection>
        <p className="fore-2">Update your profile details to ensure accurate and up-to-date information is displayed.</p>
        <BioSetting user={user} setUser={setUser} />
        <UsernameSetting user={user} setUser={setUser} />
        <EmailSetting/>
        <PasswordSetting/>
    </div>
}

export { Settings }