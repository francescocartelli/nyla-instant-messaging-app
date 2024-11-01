import { Chat } from "react-bootstrap-icons"
import { useNavigate } from "react-router-dom"

import { useStatus } from 'hooks'

import { Button } from "components/Commons/Buttons"

import { UserCard, UsersSearchList } from "components/Users/Users"

import userAPI from 'api/userAPI'
import chatAPI from "api/chatAPI"

function UsersSearch({ user }) {
    const navigate = useNavigate()

    const [redirectStatus, redirectStatusActions] = useStatus({ isReady: true })

    const onRedirect = (idChat) => navigate(`/chats/${idChat}`)

    const onClickOpenChat = (u) => {
        redirectStatusActions.setLoading()
        chatAPI.createChat({ name: null, users: [u, user], isGroup: false })
            .then(res => res.json())
            .then(chat => {
                onRedirect(chat.id);
                redirectStatusActions.setReady()
            })
            .catch(err => { console.log(err); redirectStatusActions.setError() })
    }

    return <div className="d-flex flex-grow-1 align-self-stretch mt-2 mb-2 h-0">
        <UsersSearchList onSearch={userAPI.getUsers} onRenderItem={(u) => <UserCard key={u.id} user={u}>
            <div className="d-flex flex-grow-1 justify-content-end gap-2">
                {user.id === u.id ?
                    <div className="card-2"><p className="fore-2 m-0">You</p></div> :
                    <Button disabled={redirectStatus.isLoading} onClick={() => onClickOpenChat(u)}>open chat <Chat className="size-2 fore-2-btn" /></Button>}
            </div>
        </UserCard>} />
    </div>
}

export { UsersSearch }