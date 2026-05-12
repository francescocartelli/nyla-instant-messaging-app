import { PersonX, Check2Circle, X, Hourglass } from 'react-bootstrap-icons'
import { Check2Square, ExclamationCircle } from 'react-bootstrap-icons'

import { Button } from '@/components/Commons/Buttons'

import { useDeleteAccount } from './useDeleteAccount'

const successMessage = {
    icon: <Check2Square className='fore-2' size='2em' />,
    title: 'Deletion successful',
    description: `The acount deletion is complete, you will be redirected to login.`
}

const errorMessage = {
    icon: <ExclamationCircle className='fore-2' size='2em' />,
    title: 'Something went wrong',
    description: 'The account deletion is not complete, please retry later.'
}

function DeleteAlert({ icon, title, description }) {
    return <div className='d-flex flex-row align-items-center gap-2'>
        {icon}
        <div className='d-flex flex-column'>
            <p className='m-0'><b>{title}</b></p>
            <span>{description}</span>
        </div>
    </div>
}

export function DeleteAccountContainer({ onDelete, onDeleteSuccessful, accountDeletionTime }) {
    const {
        isDeleting, setDeleting,
        isDeleteAccountDisabled, deleteStatus,
        message, deleteAccount
    } = useDeleteAccount(onDelete, onDeleteSuccessful, successMessage, errorMessage, accountDeletionTime)

    return <form className="d-flex flex-column gap-3">
        <div className="d-flex flex-row gap-2 align-items-center">
            <p className='fore-1 m-0'>
                Deleting your account and all related resources is permanent and cannot be undone.
            </p>
            <div className='flex-grow-1'></div>
            <Button disabled={isDeleting} onClick={() => setDeleting(true)}>Delete Account <PersonX className="fore-2 size-1" size='1.5em' /></Button>
        </div>
        {isDeleting && <>
            <div className='d-flex flex-column mb-1'>
                <p className='fore-1 mb-0'>
                    Please take a moment to review the consequences before continuing.
                    Confirmation will unlock in {accountDeletionTime / 1000} seconds.
                </p>
                <b className='fore-1'>
                    Are you sure you want to permanently delete your account?
                </b>
            </div>
            <div className='d-flex flex-row w-100 gap-2'>
                <Button className='flex-grow-1' disabled={!deleteStatus.isReady || isDeleteAccountDisabled} onClick={deleteAccount}>Ok <Check2Circle className='fore-danger' size='1.5em' /></Button>
                <Button className='flex-grow-1' disabled={!deleteStatus.isReady} onClick={() => setDeleting(false)}>Cancel <X className='fore-2' size='1.5em' /></Button>
            </div>
            {deleteStatus.isLoading && <DeleteAlert icon={<Hourglass className='fore-2' size='2em' />}
                title='Deleting account'
                description='The operaction can take a while...' />}
            {message && <DeleteAlert {...message} />}
        </>}
    </form>
}
