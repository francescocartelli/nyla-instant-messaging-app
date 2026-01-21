import { useCallback, useRef, useState } from 'react'
import { Check2 } from 'react-bootstrap-icons'

import { Button } from '@/components/Commons/Buttons'
import { RTEditor, Toolbar } from '@/components/SEditor'

const initialContent = [{ type: 'paragraph', children: [{ text: '' }] }]

function MessageEditor({ initial, onSendMessage, isDisabled }) {
    const [content, setContent] = useState(initial || initialContent)
    const editorRef = useRef()

    const resetEditor = useCallback(() => {
        setContent(initialContent)
        editorRef.current.reset()
    }, [])

    const onSubmitMessage = ev => {
        ev.preventDefault()
        onSendMessage(content)
        resetEditor()
    }

    return <>
        <RTEditor value={content} setValue={setContent} toolbar={<Toolbar />} placeholder="Write yout message here..." ref={editorRef} />
        <form onSubmit={onSubmitMessage}>
            <Button type="submit" className={"circle"} disabled={isDisabled}><Check2 className="fore-success size-1" /></Button>
        </form>
    </>
}

export default MessageEditor