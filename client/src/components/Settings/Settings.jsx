import { useMemo, useState } from 'react'
import { Check2, Hourglass, Pencil, XCircle } from 'react-bootstrap-icons'

import { useStatus } from '@/hooks'

import { Button } from '@/components/Commons/Buttons'
import { StatusLayout } from '@/components/Commons/Layout'

function Title({ children }) {
    return <h3 className="fore-2 m-0">{children}</h3>
}

function SectionTitle({ children }) {
    return <h5 className="fore-2 m-0">{children}</h5>
}

function SettingSection({ title, children, footer }) {
    return <div className='d-flex flex-column align-items-stretch gap-2'>
        <SectionTitle>{title}</SectionTitle>
        {children}
        <p className="fore-2 fs-80">{footer}</p>
    </div>
}

function SettingSubmitWrapper({ value, setValue, isInvalid, onRenderSetting, onSubmit, onSuccess, onCancel, confirmDisabled, editDisabled }) {
    const [isEditing, setEditing] = useState(false)
    const [submitStatus, submitStatusActions] = useStatus({ isReady: true })

    const onSubmitClick = ev => {
        ev.preventDefault()
        setEditing(false)
        submitStatusActions.setLoading()
        onSubmit(value)
            .then(() => { submitStatusActions.setReady(); onSuccess(value) })
            .catch(err => { onCancelClick(); submitStatusActions.setError() })
    }

    const onCancelClick = () => {
        onCancel()
        setEditing(false)
    }

    const setting = useMemo(() => onRenderSetting({
        value: value,
        onChange: ev => setValue(ev.target.value),
        disabled: !isEditing,
        isInvalid
    }), [onRenderSetting, value, setValue, isEditing, isInvalid])

    const onEditClick = () => setEditing(true)

    return <form className="d-flex flex-row gap-2 align-items-center">
        {setting}
        <div className='flex-grow-1'></div>
        <StatusLayout status={submitStatus}
            loading={<Button disabled><Hourglass className="fore-2 size-1" /></Button>}
            ready={isEditing ? <>
                <Button disabled={isInvalid || confirmDisabled} onClick={onSubmitClick}><Check2 className="fore-2 size-1" /></Button>
                <Button onClick={onCancelClick}><XCircle className="fore-2 size-1" /></Button>
            </> : <Button onClick={onEditClick} disabled={editDisabled}><Pencil className="fore-2 size-1" /></Button>}
        />
    </form>
}

export { SettingSection, SettingSubmitWrapper, Title }

