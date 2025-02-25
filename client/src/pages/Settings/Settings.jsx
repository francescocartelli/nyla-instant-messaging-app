

import { Text } from '@/components/Commons/Inputs'

import { PasswordRegistration, UsernameRegistration } from '@/components/Account/Account'

import { SettingCard, SettingSection, SettingSubSection } from '@/components/Settings/Settings'

import userAPI from '@/api/userAPI'

function BioSetting({ user, setUser }) {
    return <>
        <SettingSubSection>Bio</SettingSubSection>
        <SettingCard initialValue={user?.bio}
            onConfirm={(value) => userAPI.updateUser(user.id, { bio: value })}
            confirmCallback={(value) => setUser(p => ({ ...p, bio: value }))}
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
            confirmCallback={(value) => setUser(p => ({ ...p, username: value }))}
            onRenderChildren={(value, onChange, disabled, setInvalid) => <div className="d-flex flex-row flex-grow-1 gap-2">
                <UsernameRegistration username={value} setUsername={onChange} disabled={disabled} setInvalid={setInvalid} onCheck={userAPI.getUsers} />
            </div>}></SettingCard>
        <p className="fore-2 fs-80">Changing your username will affect your sing-in credential.</p>
    </>
}

function EmailSetting() {
    return <>
        <SettingSubSection>EMail</SettingSubSection>
        <SettingCard initialValue="" initialInvalid={true} onConfirm={() => { }} confirmCallback={() => { }}
            onRenderChildren={(value, onChange, disabled, setInvalid) => <div className="d-flex flex-row flex-grow-1 gap-2">
                <Text type="password" value="email is not available" onChange={onChange} disabled={true} />
            </div>}></SettingCard>
        <p className="fore-2 fs-80">This setting is locked.</p>
    </>
}

function PasswordSetting() {
    return <>
        <SettingSubSection>Change Password</SettingSubSection>
        <SettingCard initialValue="" initialInvalid={true} onConfirm={() => { }} confirmCallback={() => { }}
            onRenderChildren={(value, onChange, disabled, setInvalid) => <div className="d-flex flex-row flex-grow-1 gap-2">
                <PasswordRegistration password={value} setPassword={onChange} setInvalid={setInvalid} disabled={disabled} />
            </div>}></SettingCard>
        <p className="fore-2 fs-80">This setting is locked.</p>
    </>
}

function SettingsPage({ user, setUser }) {
    return <div className="d-flex flex-column flex-grow-1 align-self-stretch gap-2 mt-3 scroll-y h-0">
        <SettingSection>Profile Details</SettingSection>
        <p className="fore-2">Update your profile details to ensure accurate and up-to-date information is displayed.</p>
        <BioSetting user={user} setUser={setUser} />
        <UsernameSetting user={user} setUser={setUser} />
        <EmailSetting />
        <PasswordSetting />
    </div>
}

export default SettingsPage