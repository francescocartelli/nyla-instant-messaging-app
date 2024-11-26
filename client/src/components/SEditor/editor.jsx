import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useState } from 'react'
import { Slate, Editable, withReact } from 'slate-react'
import { createEditor, Transforms } from 'slate'
import { withHistory } from 'slate-history'
import { ThreeDots, X } from 'react-bootstrap-icons'

import { HEADING_ONE, HEADING_TWO, LINK, LIST_ITEM, ORDERED_LIST, UNORDERED_LIST } from './blockTypes'
import { BOLD, CODE, ITALIC, UNDERLINE } from './markTypes'
import { withHtml } from './deserialize'

const initialValue = [{ type: 'paragraph', children: [{ text: '' }] }]

function Leaf({ attributes, children, leaf }) {
    if (leaf[BOLD]) children = <strong>{children}</strong>
    if (leaf[ITALIC]) children = <em>{children}</em>
    if (leaf[CODE]) children = <code>{children}</code>
    if (leaf[UNDERLINE]) children = <u>{children}</u>

    return <span {...attributes}>{children}</span>
}

function Block({ attributes, children, element }) {
    const style = { textAlign: element.align }

    const blocks = {
        [ORDERED_LIST]: <ol style={style} {...attributes}>{children}</ol>,
        [UNORDERED_LIST]: <ul style={style} {...attributes}>{children}</ul>,
        [LIST_ITEM]: <li style={style} {...attributes}>{children}</li>,
        [HEADING_ONE]: <h1 style={style} {...attributes}>{children}</h1>,
        [HEADING_TWO]: <h2 style={style} {...attributes}>{children}</h2>,
        [LINK]: <a {...attributes} href={element.url}>{children}</a>
    }

    const defaultBlock = <p style={style} {...attributes}>{children}</p>

    return (blocks[element.type] || defaultBlock)
}

const RTEditor = forwardRef(function RTEditor({ value = initialValue, setValue, toolbar, ...props }, ref) {
    const editor = useMemo(() => withHistory(withHtml(withReact(createEditor()))), [])

    const [isToolbarVisible, setToolbarVisible] = useState(false)
    const toggleToolbarVisibility = () => setToolbarVisible(p => !p)

    const renderLeaf = useCallback(p => <Leaf {...p} />, [])
    const renderElement = useCallback(p => <Block {...p} />, [])

    const reset = () => {
        const point = { path: [0, 0], offset: 0 }
        editor.selection = { anchor: point, focus: point }
        editor.history = { redos: [], undos: [] }
        editor.children.map(() => Transforms.delete(editor, { at: [0] }))
        editor.children = initialValue
        editor.onChange()
    }

    useImperativeHandle(ref, () => ({
        reset
    }))

    return <div className='editor-wrapper'>
        <Slate editor={editor} initialValue={value} onChange={v => setValue(v)}>
            {toolbar && isToolbarVisible && <div className='toolbar-wrapper'>{toolbar}</div>}
            <div className='editor-overlay'>
                <Editable autoFocus className='content-editor' renderLeaf={renderLeaf} renderElement={renderElement} {...props} />
            </div>
        </Slate>
        {toolbar && <button type="button" onClick={toggleToolbarVisibility} className='editor-button toolbar-absolute'>{isToolbarVisible ? <X /> : <ThreeDots />}</button>}
    </div>
})

function RTViewer({ value }) {
    const editor = useMemo(() => withReact(createEditor()), [])

    const renderLeaf = useCallback(p => <Leaf {...p} />, [])
    const renderElement = useCallback(p => <Block {...p} />, [])

    return <Slate editor={editor} initialValue={value}>
        <Editable readOnly className='content-editor' renderLeaf={renderLeaf} renderElement={renderElement} />
    </Slate>
}

export { RTEditor, RTViewer }