import { useCallback } from 'react'

import { useRemoteValidation, useValidation } from '@/hooks'

import { usernameReg } from '@/constants/regs'

import userAPI from '@/api/userAPI'

import { Text } from '@/components/Commons/Inputs'

import { SettingSection, SettingSubmitWrapper, Title } from '@/components/Settings/Settings'

import { EmailRegistration, PasswordRegistration, RepeatPassword, UsernameRegistration } from '@/components/Account/Account'

function SettingsPage({ user, setUser }) {
    const onCheckUsername = useCallback((u, setInvalid) => userAPI.getUsers(u, 'exact')
        .then(res => res.json())
        .then(users => setInvalid(users.length > 0)), [])

    const bioValidation = useValidation(user.bio)
    const usernameValidation = useRemoteValidation(user.username, value => usernameReg.test(value), onCheckUsername, 2000)

    return <div className="d-flex flex-column flex-grow-1 align-self-stretch gap-3 mt-3 scroll-y h-0">
        <Title>Profile Details</Title>
        <p className="fore-1">Update your profile details to ensure accurate and up-to-date information are provided.</p>
        <SettingSection title='Bio' footer='Your personal bio will be visible to those viewing your profile informations.'>
            <SettingSubmitWrapper
                {...bioValidation}
                onCancel={() => bioValidation.setValue(user.bio)}
                confirmDisabled={bioValidation.value === user.bio}
                onSubmit={bio => userAPI.updateUser(user.id, { bio })}
                onSuccess={bio => setUser(p => ({ ...p, bio }))}
                onRenderSetting={({ isInvalid, ...props }) => <Text placeholder="Your personal bio..." {...props} />} />
        </SettingSection>
        <SettingSection title='Username' footer='Changing your username will affect your sing-in credential.'>
            <SettingSubmitWrapper
                {...usernameValidation}
                onCancel={() => usernameValidation.setValue(user.username)}
                confirmDisabled={usernameValidation.isRemoteInvalid || usernameValidation.value === user.username}
                onSubmit={username => userAPI.updateUser(user.id, { username })}
                onSuccess={username => setUser(p => ({ ...p, username }))}
                onRenderSetting={props =>
                    <UsernameRegistration placeholder="Your personal bio..." {...props} isTaken={usernameValidation.isRemoteInvalid} checkStatus={usernameValidation.checkStatus} />} />
        </SettingSection>
        <SettingSection title='Password' footer='This setting is locked.'>
            <SettingSubmitWrapper
                editDisabled={true}
                onRenderSetting={props =>
                    <EmailRegistration {...props} />} />
        </SettingSection>
        <SettingSection title='Email' footer='This setting is locked.'>
            <SettingSubmitWrapper
                editDisabled={true}
                onRenderSetting={props => <>
                    <PasswordRegistration {...props} />
                    <RepeatPassword {...props} />
                </>} />
        </SettingSection>
    </div>
}

export default SettingsPage