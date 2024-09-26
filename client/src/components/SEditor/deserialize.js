import { Transforms, Element as SlateElement } from 'slate'
import { jsx } from 'slate-hyperscript'

import { HEADING_ONE, HEADING_TWO, LINK, LIST_ITEM, ORDERED_LIST, PARAGRAPH, UNORDERED_LIST } from './blockTypes'
import { BOLD, CODE, ITALIC, STRIKETHROUGH, UNDERLINE } from './markTypes'

const ELEMENT_TAGS = {
    A: el => ({ type: LINK, url: el.getAttribute('href') }),
    BLOCKQUOTE: () => ({ type: 'quote' }),
    H1: () => ({ type: HEADING_ONE }),
    H2: () => ({ type: HEADING_TWO }),
    H3: () => ({ type: 'heading-three' }),
    H4: () => ({ type: 'heading-four' }),
    H5: () => ({ type: 'heading-five' }),
    H6: () => ({ type: 'heading-six' }),
    IMG: el => ({ type: 'image', url: el.getAttribute('src') }),
    LI: () => ({ type: LIST_ITEM }),
    OL: () => ({ type: ORDERED_LIST }),
    P: () => ({ type: PARAGRAPH }),
    PRE: () => ({ type: CODE }),
    UL: () => ({ type: UNORDERED_LIST }),
}

const TEXT_TAGS = {
    CODE: () => ({ [CODE]: true }),
    DEL: () => ({ [STRIKETHROUGH]: true }),
    EM: () => ({ [ITALIC]: true }),
    I: () => ({ [ITALIC]: true }),
    S: () => ({ [STRIKETHROUGH]: true }),
    STRONG: () => ({ [BOLD]: true }),
    B: () => ({ [BOLD]: true }),
    U: () => ({ [UNDERLINE]: true }),
}

const deserialize = el => {
    if (el.nodeType === 3) return el.textContent
    else if (el.nodeType !== 1) return null
    else if (el.nodeName === 'BR') return '\n'

    const { nodeName } = el
    let parent = el

    if (nodeName === 'PRE' && el.childNodes[0] && el.childNodes[0].nodeName === 'CODE') parent = el.childNodes[0]

    let children = Array.from(parent.childNodes).map(deserialize).flat()

    if (children.length === 0) children = [{ text: '' }]
    if (el.nodeName === 'BODY') return jsx('fragment', {}, children)

    if (ELEMENT_TAGS[nodeName]) return jsx('element', ELEMENT_TAGS[nodeName](el), children)
    if (TEXT_TAGS[nodeName]) return children.map(child => SlateElement.isElement(child) ?  jsx('element', child, child.children) : jsx('text', TEXT_TAGS[nodeName](el), child))

    return children
}

const withHtml = editor => {
    const { insertData, isInline, isVoid } = editor

    editor.isInline = element => element.type === 'link' ? true : isInline(element)
    editor.isVoid = element => element.type === 'image' ? true : isVoid(element)
    editor.insertData = data => {
        const html = data.getData('text/html')

        if (html) {
            const parsed = new DOMParser().parseFromString(html, 'text/html')
            const fragment = deserialize(parsed.body)
            Transforms.insertFragment(editor, fragment)
        } else insertData(data)
    }

    return editor
}

export { withHtml }