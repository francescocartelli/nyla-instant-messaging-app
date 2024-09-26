import { Editor, Element, Transforms, Range } from 'slate'
import { LINK, LIST_ITEM, LIST_TYPES, PARAGRAPH, TEXT_ALIGN_TYPES } from './blockTypes'

const isBlockListType = (format) => LIST_TYPES.includes(format)
const isTextAlignType = (format) => TEXT_ALIGN_TYPES.includes(format)

const getAdditionalBlockProps = (isListBlockType, isTextAlignType, format, isActive) => {
    if (isTextAlignType) return { align: isActive ? undefined : format }
    else return { type: isActive ? PARAGRAPH : isListBlockType ? LIST_ITEM : format }
}

const isMarkActive = (editor, format) => {
    const marks = Editor.marks(editor)
    return marks && marks[format]
}

const isBlockActive = (editor, format, blockType = 'type') => {
    const { selection } = editor
    if (!selection) return false

    const [match] = Array.from(
        Editor.nodes(editor, {
            at: Editor.unhangRange(editor, selection),
            match: n => !Editor.isEditor(n) && Element.isElement(n) && n[blockType] === format
        })
    )

    return !!match
}

const toggleMark = (editor, format) => {
    if (isMarkActive(editor, format)) Editor.removeMark(editor, format)
    else Editor.addMark(editor, format, true)
}

const toggleBlock = (editor, format) => {
    const isActive = isBlockActive(editor, format)

    const isList = isBlockListType(format)
    const isAlign = isTextAlignType(format)

    Transforms.unwrapNodes(editor, {
        match: n => !Editor.isEditor(n) && Element.isElement(n) && LIST_TYPES.includes(n.type) && !TEXT_ALIGN_TYPES.includes(format),
        split: true
    })

    const additionalProps = getAdditionalBlockProps(isList, isAlign, format, isActive)

    Transforms.setNodes(editor, additionalProps)

    if (!isActive && isList) Transforms.wrapNodes(editor, { type: format, children: [] })
}

const isLinkActive = editor => {
    const [link] = Editor.nodes(editor, { match: n => n.type === LINK })

    return !!link;
}

const toggleLink = (editor, url) => {
    if (isLinkActive(editor)) return Transforms.unwrapNodes(editor, { match: n => !Editor.isEditor(n) && Element.isElement(n) && n.type === LINK })

    const { selection } = editor
    const isCollapsed = selection && Range.isCollapsed(selection)

    const link = { type: LINK, url, children: [{ text: url }] }

    if (isCollapsed) Transforms.insertNodes(editor, link)
    else {
        Transforms.wrapNodes(editor, link, { split: true })
        Transforms.collapse(editor, { edge: 'end' })
    }
}

const flatNode = ({ text, children }) => {
    if (text) return [text]
    else if (children && children.length > 0) return children.map(flatNode).join("") + "\n"
}

const flatRTNodes = (nodes) => {
    const we = nodes.map(flatNode).join("").trim()
    console.log(we)
    return we
}

export { isMarkActive, isBlockActive, toggleMark, toggleBlock, toggleLink, isLinkActive, flatRTNodes }