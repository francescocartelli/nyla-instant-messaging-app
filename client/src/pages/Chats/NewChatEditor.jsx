import React, { useCallback, useMemo, useState } from 'react'
import { Check2Square, XCircle } from 'react-bootstrap-icons'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/Commons/Buttons'

import { UsersManager, UserCard } from '@/components/Users/Users'

import { NewChatBasicSettings, UserBadges } from '@/components/Chats/ChatEditor'

import chatAPI from '@/api/chatAPI'
import userAPI from '@/api/userAPI'

function UserInChat({ user, onAdd, onRemove, isSelf, isSelected }) {
    return <UserCard user={user} badges={<UserBadges isSelf={isSelf} isAdmin={isSelf || user.isAdmin} />}>
        <div className={`d-flex flex-grow-1 justify-content-end ga˚p-2 align-items-center more-options`}>
            {!isSelf && <>{
                isSelected ? <Button key="remove" onClick={() => onRemove()}><XCircle className="fore-danger size-1" /></Button> :
                    <Button key="add" onClick={() => onAdd()}> <Check2Square className="fore-success size-1" /></Button>}
            </>}
        </div>
    </UserCard>
}

function NewChatEditorPage({ user }) {
    const [chat, setChat] = useState({ name: "", users: [user], isGroup: true })
    const [isLoading, setLoading] = useState(false)

    const navigate = useNavigate()
    const onClose = () => navigate("/chats")

    const onSubmit = () => {
        setLoading(true)
        chatAPI.createChat(chat, user).then(res => res.json())
            .then(chat => navigate(`/chats/${chat.id}`))
            .catch(err => { })
            .finally(() => setLoading(false))
    }

    const addUser = u => setChat(p => ({ ...p, users: [...p.users, u] }))
    const removeUser = u => setChat(p => ({ ...p, users: p.users.filter(i => i.id !== u.id) }))
    const onChangeGroupName = (ev) => setChat(p => ({ ...p, name: ev.target.value }))

    const renderUser = useCallback(u => <UserInChat key={u.id} user={u}
        onAdd={() => addUser(u)} onRemove={() => removeUser(u)}
        isSelected={chat?.users?.find(i => i.id === u.id)}
        isSelf={u.id === user.id}
    />, [chat.users, user.id])

    const isSubmitButtonDisabled = useMemo(() => isLoading || chat.users?.length < 2 || chat.name === "", [isLoading, chat])

    return <div className="d-flex flex-column flex-grow-1 align-self-stretch gap-3 mt-2 mb-1 h-0">
        <NewChatBasicSettings close={onClose} name={chat.name} onChange={onChangeGroupName} />
        <UsersManager isAdmin={true} renderUserInSearch={renderUser} renderUserInChat={renderUser} users={chat.users} onSearch={userAPI.getUsers} />
        <Button disabled={isSubmitButtonDisabled} onClick={onSubmit}>Create Group Chat</Button>
    </div>
}

export default NewChatEditorPage