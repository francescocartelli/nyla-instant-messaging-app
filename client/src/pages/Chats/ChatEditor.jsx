import React, { useCallback, useMemo, useState } from 'react'
import { Check2, Check2Square, DoorOpenFill, Hourglass, Pencil, XCircle } from 'react-bootstrap-icons'
import { useNavigate } from 'react-router-dom'

import { useStatus } from '@/hooks'

import { Crown, XCrown } from '@/components/Icons'

import { LoadingAlert } from '@/components/Commons/Alerts'
import { Button } from '@/components/Commons/Buttons'
import { Text } from '@/components/Commons/Inputs'
import { MoreOptions } from '@/components/Commons/Layout'

import { AdvancedSettings, BasicSettings, UserBadges } from '@/components/Chats/ChatEditor'

import { UserCard, UsersManager } from '@/components/Users/Users'

import chatAPI from '@/api/chatAPI'
import userAPI from '@/api/userAPI'

import useUsersSet from './useUsersSet'

function UserInChat({ user, onAdd, onRemove, onAdmin, onLeave, isSelf, isSelected }) {
    const [isLoading, setLoading] = useState(false)

    const onAction = (action) => {
        setLoading(true)
        action().finally(() => setLoading(false))
    }

    const buttons = isSelf ?
        [...(onLeave ? [<Button key='leave' onClick={() => onLeave(setLoading)}><DoorOpenFill className="fore-2 size-1" /></Button>] : [])] :
        [
            ...(isSelected ?
                [onRemove ? <Button key="remove" onClick={() => onAction(onRemove)}><XCircle className="fore-danger size-1" /></Button> : []] :
                [onAdd ? <Button key="add" onClick={() => onAction(onAdd)}> <Check2Square className="fore-success size-1" /></Button> : []]),
            ...((isSelected && onAdmin) ? [<Button key="update" onClick={() => onAction(onAdmin)}>
                {user.isAdmin ? <XCrown className="fore-2 size-1" /> : <Crown className="text-warning size-1" />}
            </Button>] : [])
        ]

    return <UserCard user={user} badges={<UserBadges isSelf={isSelf} isAdmin={user.isAdmin} />}>
        <div className={`d-flex flex-grow-1 justify-content-end ga˚p-2 align-items-center more-options`}>
            {isLoading ? <Button disabled><Hourglass className="fore-2 size-1" /></Button> : <MoreOptions buttons={buttons} />}
        </div>
    </UserCard>
}

function ExistingChatUsersManager({ user, users, isAdmin, addUser, updateUser, removeUser, removeCurrentUser }) {
    const usersIdsSet = useUsersSet(users)

    const renderUserInChat = useCallback(u => <UserInChat key={u.id} user={u}
        onAdd={isAdmin ? () => addUser(u) : null} onRemove={isAdmin ? () => removeUser(u) : null} onLeave={removeCurrentUser}
        onAdmin={isAdmin ? () => updateUser({ ...u, isAdmin: !u.isAdmin }) : null}
        isSelected={usersIdsSet.has(u.id)}
        isSelf={u.id === user.id}>
    </UserInChat>, [usersIdsSet, isAdmin, user.id, addUser, removeUser, removeCurrentUser, updateUser])

    const renderUserInSearch = useCallback(u => <UserInChat key={u.id} user={u}
        onAdd={() => addUser(u)} onRemove={() => removeUser(u)}
        isSelected={usersIdsSet.has(u.id)}
        isSelf={u.id === user.id}
    />, [usersIdsSet, user.id, addUser, removeUser])

    return <UsersManager isAdmin={isAdmin} renderUserInChat={renderUserInChat} renderUserInSearch={renderUserInSearch} users={users} onSearch={userAPI.getUsers} />
}

function ExistingChatBasicSettings({ chat, setChat, isAdmin, close }) {
    const [chatName, setChatName] = useState(chat?.name)
    const [isEditingChat, setEditingChat] = useState(false)
    const [chatNameStatus, chatNameStatusActions] = useStatus({ isReady: true })

    const onClickCancelEditChatName = () => { setEditingChat(false); setChatName(chat.name) }
    const onClickConfirmEditChatName = () => {
        chatNameStatusActions.setLoading()
        chatAPI.updateChat(chat.id, { name: chatName })
            .then(() => {
                chatNameStatusActions.setReady()
                setChat(p => ({ ...p, name: chatName }))
            })
            .catch(chatNameStatusActions.setError)
            .finally(() => setEditingChat(false))
    }

    return <BasicSettings title="Settings:" close={close} isGroup={chat.isGroup}>
        {chat.isGroup && <div className="d-flex flex-row gap-2 align-items-center">
            <Text className="flex-grow-1" placeholder="Group name..." disabled={!isEditingChat} value={chatName} onChange={ev => setChatName(ev.target.value)} />
            {isAdmin && <div>{isEditingChat ?
                <div className="d-flex flex-row gap-2">
                    <Button disabled={chatNameStatus.isLoading} onClick={onClickCancelEditChatName}><XCircle className="fore-2-btn size-1" /></Button>
                    <Button disabled={chatNameStatus.isLoading} onClick={onClickConfirmEditChatName}><Check2 className="fore-2-btn size-1" /></Button>
                </div> : <Button onClick={() => setEditingChat(true)}><Pencil className="fore-2-btn size-1" /></Button>
            }</div>}
        </div>}
    </BasicSettings>
}

function ChatEditor({ user, chat, setChat, users, areUsersLoading, setUsers, close }) {
    const isAdmin = useMemo(() => users && users.find && users.find(u => u.id === user.id)?.isAdmin, [user.id, users])

    const navigate = useNavigate()
    const onLeaveCallback = useCallback(() => navigate("/chats"), [navigate])
    const deleteChat = useCallback(() => chatAPI.deleteChat(chat.id).then(onLeaveCallback), [chat.id, onLeaveCallback])

    const onAddUser = useCallback(u => {
        setUsers(p => [...p, u])
        setChat(p => ({ ...p, nUsers: p.nUsers + 1 }))
    }, [setUsers, setChat])

    const onRemoveUser = useCallback(u => {
        setUsers(p => p.filter(i => i.id !== u.id))
        setChat(p => ({ ...p, nUsers: p.nUsers - 1 }))
    }, [setUsers, setChat])

    const addUser = useCallback(u => chatAPI.addUserChat(chat.id, u.id).then(() => onAddUser(u)), [chat.id, onAddUser])
    const updateUser = useCallback(u => chatAPI.updateUserChat(chat.id, u.id, u).then(() => setUsers(p => p.map(q => q.id === u.id ? { ...q, ...u } : q))), [chat.id, setUsers])
    const removeUser = useCallback(u => chatAPI.removeUserChat(chat.id, u.id).then(() => onRemoveUser(u)).catch(err => { }), [chat.id, onRemoveUser])
    const removeCurrentUser = useCallback(() => chatAPI.removeCurrentUserChat(chat.id).then(() => onLeaveCallback()).catch(err => { }), [chat.id, onLeaveCallback])

    const isAdvanceSettingVisible = useMemo(() => isAdmin || !chat.isGroup, [isAdmin, chat])

    return <div className="d-flex flex-column flex-grow-1 gap-3 mb-1 h-0">
        <ExistingChatBasicSettings chat={chat} setChat={setChat} isAdmin={isAdmin} close={close} />
        {areUsersLoading ? <LoadingAlert /> : <>
            {chat.isGroup && <ExistingChatUsersManager user={user} users={users} isAdmin={isAdmin}
                addUser={addUser} updateUser={updateUser} removeUser={removeUser} removeCurrentUser={removeCurrentUser} />}
        </>}
        {isAdvanceSettingVisible && <AdvancedSettings deleteChat={deleteChat} />}
    </div>
}

export default ChatEditor
