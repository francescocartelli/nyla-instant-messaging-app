import { useCallback, useEffect, useState } from 'react'
import { ArrowDownUp, Funnel, PlusCircleFill, XCircleFill } from 'react-bootstrap-icons'

import { useRelativeDateTime, useStatus } from '@/hooks'

import { Button } from '@/components/Commons/Buttons'
import { OptionsLayout, PagesControl, StatusLayout } from '@/components/Commons/Layout'
import { InformationBox, SomethingWentWrong } from '@/components/Commons/Misc'

import { ChatCard, ChatCardSketeleton, FilterOption, NewChatButton, OrderOption } from '@/components/Chats/Chats'

import chatAPI from '@/api/chatAPI'

function ChatsPage() {
    const [chats, setChats] = useState([])
    const [chatsPage, setChatsPage] = useState(1)
    const [chatsNPages, setChatsNPages] = useState(0)
    const [isAsc, setAsc] = useState(false)
    const [isGroup, setGroup] = useState(null)
    const [selectedOption, setSelectedOption] = useState(null)

    const [chatsStatus, chatsStatusActions] = useStatus()

    const getRelative = useRelativeDateTime()

    useEffect(() => {
        const controller = new AbortController()
        chatsStatusActions.setLoading()
        chatAPI.getChatPersonal(chatsPage, isAsc, isGroup)
            .then(res => res.json())
            .then(({ page, nPages, chats }) => {
                chatsStatusActions.setReady()
                setChatsNPages(nPages)
                setChats([...chats])
            })
            .catch(err => chatsStatusActions.setError())

        return () => {
            controller?.abort()
            setChats([])
        }
    }, [chatsPage, chatsStatusActions, isAsc, isGroup])

    const toggleOptions = useCallback(option => setSelectedOption(selectedOption === option ? null : option), [selectedOption])

    return <div className="d-flex flex-column gap-3 mt-2 mb-2 align-self-stretch flex-grow-1">
        <div className="d-flex flex-column gap-3 align-self-stretch flex-grow-1">
            <div className="d-flex flex-row gap-2 scroll-x">
                <div className={`flex-row gap-2 ${selectedOption ? "hide-small" : "d-flex"}`}>
                    <Button onClick={() => toggleOptions("group")}><PlusCircleFill className="fore-2-btn size-1" /></Button>
                    <Button onClick={() => toggleOptions("order")} disabled={chats.length < 2}><ArrowDownUp className="fore-2 size-1" /></Button>
                    <Button onClick={() => toggleOptions("filter")} disabled={chats.length < 2}><Funnel className="fore-2 size-1" /></Button>
                </div>
                <div className="flex-grow-1"></div>
                <OptionsLayout option={selectedOption} options={{
                    group: <NewChatButton />,
                    order: <OrderOption isAsc={isAsc} setAsc={setAsc} disabled={chatsStatus.isLoading} />,
                    filter: <FilterOption isGroup={isGroup} setGroup={setGroup} onReset={() => setChatsPage(1)} disabled={chatsStatus.isLoading} />
                }} />
                {selectedOption && <Button onClick={() => setSelectedOption(null)}><XCircleFill className="fore-2 size-1" /></Button>}
            </div>
            <div className="d-flex flex-column gap-3 flex-grow-1 scroll-y h-0">
                <StatusLayout status={chatsStatus}
                    loading={[...Array(10).keys()].map((i) => <ChatCardSketeleton key={`chat-skeleton-${i}`} />)}
                    ready={<>
                        {chats.length === 0 && <InformationBox title="Wow, such an empty!" subtitle="All the chats related to you will be shown here!" />}
                        {chats.map(chat => <ChatCard key={chat.id} chat={chat} relativeDateTime={getRelative(chat.updatedAt)} />)}
                    </>}
                    error={<SomethingWentWrong explanation="It is not possible to load your personal chats!" />}
                />
            </div>
        </div>
        <div className="align-self-center">
            <PagesControl page={chatsPage} nPages={chatsNPages} onChangePage={setChatsPage} disabled={!chatsStatus.isReady} />
        </div>
    </div>
}

export default ChatsPage
