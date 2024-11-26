import { useState } from 'react'
import { useSlate } from 'slate-react'
import { Transforms } from 'slate'

import { isBlockActive, isLinkActive, isMarkActive, toggleBlock, toggleLink, toggleMark } from './utils'

function MarkButton({ mark, children }) {
    const editor = useSlate()
    const onMouseDown = ev => { ev.preventDefault(); toggleMark(editor, mark) }

    return <button type="button" className={isMarkActive(editor, mark) ? "editor-button active" : "editor-button"} onMouseDown={onMouseDown}>{children}</button>
}

function BlockButton({ block, children }) {
    const editor = useSlate()
    const onMouseDown = ev => { ev.preventDefault(); toggleBlock(editor, block) }

    return <button type="button" className={isBlockActive(editor, block) ? "editor-button active" : "editor-button"} onMouseDown={onMouseDown}>{children}</button>
}

function LinkButton({ children }) {
    const editor = useSlate()

    const [isVisible, setVisible] = useState(false)
    const [url, setUrl] = useState("")

    const onMouseDown = (ev) => {
        const { selection } = editor

        console.log(selection)

        ev.preventDefault()
        setVisible(true)

        Transforms.select(editor, selection)
    }

    const onChange = ev => {
        ev.preventDefault()
        setUrl(ev.target.value)
    }

    const onConfirm = ev => {
        ev.preventDefault()
        toggleLink(editor, url)
        clearLink()
    }

    const onCancel = ev => {
        ev.preventDefault()
        clearLink()
    }

    const clearLink = () => {
        setVisible(false)
        setUrl("")
    }

    return <div onBlur={() => clearLink()}>
        {isVisible ?
            <>
                <input value={url} onChange={onChange} placeholder="url"></input>
                <button onClick={onConfirm}>Ok</button>
                <button onClick={onCancel}>Cancel</button>
            </> :
            <button className={isLinkActive(editor) ? "editor-button active" : "editor-button"} onMouseDown={onMouseDown}>{children}</button>}
    </div>
}

export { MarkButton, BlockButton, LinkButton }