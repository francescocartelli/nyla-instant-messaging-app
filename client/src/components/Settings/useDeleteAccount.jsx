import { useState, useEffect } from 'react'

import { useStatus } from '@/hooks'

export function useDeleteAccount(onDelete, onDeleteSuccessful, successMessage, errorMessage, accountDeletionTime) {
    const [isDeleting, setDeleting] = useState(false)
    const [isDeleteAccountDisabled, setDeleteAccountDisabled] = useState(false)
    const [deleteStatus, deleteStatusActions] = useStatus({ isReady: true })

    useEffect(() => {
        let timeout = null

        if (!isDeleting) setDeleteAccountDisabled(true)
        else { timeout = setTimeout(() => setDeleteAccountDisabled(false), accountDeletionTime) }

        return () => clearTimeout(timeout)
    }, [isDeleting])

    const [message, setMessage] = useState()

    const deleteAccount = async () => {
        deleteStatusActions.setLoading()
        onDelete()
            .then(res => res.json())
            .then(res => {
                const isOk = res.user > 0
                if (!isOk) throw new Error('not complete')

                setMessage(successMessage)
                deleteStatusActions.setReady()

                if (isOk) onDeleteSuccessful()
            })
            .catch(() => {
                setMessage(errorMessage)
                deleteStatusActions.setError()
            })
    }

    return {
        isDeleting, setDeleting,
        isDeleteAccountDisabled, deleteStatus,
        message, deleteAccount
    }
}
