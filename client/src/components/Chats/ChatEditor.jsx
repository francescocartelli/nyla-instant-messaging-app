import React, { useState } from 'react'
import { X } from 'react-bootstrap-icons'
import { Check, ChevronDown, ChevronUp, TrashFill } from 'react-bootstrap-icons'

import { Crown } from '@/components/Icons/Icons'

import { ErrorAlert, LoadingAlert } from '@/components/Commons/Alerts'
import { Button } from '@/components/Commons/Buttons'
import { Text } from '@/components/Commons/Inputs'
import { StatusLayout } from '@/components/Commons/Layout'

import { useStatus } from '@/hooks'

function UserBadges({ isSelf, isAdmin }) {
    const isVisible = isSelf || isAdmin

    return <> {isVisible && <>
        {isSelf && <div className="card-2"><span className="fore-2">You</span></div>}
        {isAdmin && <Crown className="text-warning size-2" />}</>}
    </>
}

function BasicSettings({ title, close, isGroup, children }) {
    return <div className="d-flex flex-column card-1 gap-2">
        <div className="d-flex flex-row align-items-center">
            <span className="fs-110 fw-500 flex-grow-1">{title}</span>
            <Button className="circle" onClick={close}><X className="fore-2-btn size-1" /></Button>
        </div>
        {isGroup && children}
    </div>
}

function NewChatBasicSettings({ name, onChange, close }) {
    return <BasicSettings title="Create new chat:" close={close} isGroup={true}>
        <div className="d-flex flex-row gap-2">
            <Text className="flex-grow-1" placeholder="Group name..." value={name} onChange={onChange} />
        </div>
    </BasicSettings>
}

function AdvancedSettings({ deleteChat }) {
    const [isAdvancedSettings, setAdvancedSettings] = useState(false)
    const [isDeletingChat, setDeletingChat] = useState(false)

    const [deleteStatus, deleteStatusActions] = useStatus({ isReady: true })

    const toggleAdvandedSettings = () => setAdvancedSettings(p => !p)

    const onDeleteChat = () => {
        deleteStatusActions.setLoading()
        deleteChat().catch(err => deleteStatusActions.setError())
    }

    return <div className="d-flex flex-column card-1 gap-2 ">
        <StatusLayout status={deleteStatus}
            loading={<LoadingAlert />}
            ready={<>
                <div className="d-flex flex-row gap-2 align-items-center">
                    <span className="fs-110 fw-500 flex-grow-1">Advanced Settings:</span>
                    <Button onClick={toggleAdvandedSettings}>{isAdvancedSettings ?
                        <ChevronUp className="fore-2-btn size-1" /> :
                        <ChevronDown className="fore-2-btn size-1" />}
                    </Button>
                </div>
                {isAdvancedSettings && <div className="d-flex flex-row gap-2">
                    {isDeletingChat ? <>
                        <Button className="flex-grow-1" onClick={() => onDeleteChat()}>Confirm <Check className="fore-danger size-1" /></Button>
                        <Button className="flex-grow-1" onClick={() => setDeletingChat(false)}>Cancel <X className="fore-2-btn size-1" /></Button>
                    </> : <Button className="flex-grow-1" onClick={() => setDeletingChat(true)}>Delete Chat <TrashFill className="fore-danger size-1" /></Button>}
                </div>}
            </>}
            error={<ErrorAlert />}
        />
    </div>
}

export { AdvancedSettings, BasicSettings, NewChatBasicSettings, UserBadges }

