import { useState } from 'react'
import { Check2, Hourglass, Pencil, XCircle } from 'react-bootstrap-icons'

import { useStatus } from '@/hooks'

import { Button } from '@/components/Commons/Buttons'
import { StatusLayout } from '@/components/Commons/Layout'

function SettingSection({ children }) {
    return <h3 className="fore-2 m-0">{children}</h3>
}

function SettingSubSection({ children }) {
    return <h5 className="fore-2 m-0">{children}</h5>
}

function SettingCard({ onRenderChildren, onConfirm, confirmCallback, initialValue, initialInvalid = false }) {
    const [isEditing, setEditing] = useState(false)
    const [value, setValue] = useState(initialValue)
    const [isInvalid, setInvalid] = useState(initialInvalid)

    const [confirmStatus, confirmStatusActions] = useStatus({ isReady: true })

    const onClickConfirm = (ev) => {
        ev.preventDefault()
        setEditing(false)
        confirmStatusActions.setLoading()
        onConfirm(value)
            .then(() => {
                confirmStatusActions.setReady()
                confirmCallback(value)
            })
            .catch(err => {
                setValue(initialValue)
                confirmStatusActions.setError()
            })
    }

    const onClickCancel = () => {
        setValue(initialValue)
        setEditing(false)
    }

    return <div className="d-flex flex-column gap-2">
        <div className="d-flex flex-row gap-2 align-items-center">
            {onRenderChildren(value, setValue, !isEditing, setInvalid)}
            <StatusLayout status={confirmStatus}
                loading={<Button onClick={() => { }}><Hourglass className="fore-2 size-1" /></Button>}
                ready={isEditing ? <>
                    <Button disabled={isInvalid} onClick={onClickConfirm}><Check2 className="fore-2 size-1" /></Button>
                    <Button onClick={onClickCancel}><XCircle className="fore-2 size-1" /></Button>
                </> : <Button onClick={() => setEditing(true)}><Pencil className="fore-2 size-1" /></Button>}
            />
        </div>
    </div>
}

export { SettingCard, SettingSection, SettingSubSection }
