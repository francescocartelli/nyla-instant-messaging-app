import { Code, ListOl, ListUl, TypeBold, TypeH1, TypeH2, TypeItalic, TypeUnderline } from 'react-bootstrap-icons'

import { BlockButton, MarkButton } from './buttons'
import { HEADING_ONE, HEADING_TWO, ORDERED_LIST, UNORDERED_LIST } from './blockTypes'
import { BOLD, CODE, ITALIC, UNDERLINE } from './markTypes'

function Toolbar() {
    return <>
        <MarkButton mark={BOLD}><TypeBold /></MarkButton>
        <MarkButton mark={ITALIC}><TypeItalic /></MarkButton>
        <MarkButton mark={CODE}><Code /></MarkButton>
        <MarkButton mark={UNDERLINE}><TypeUnderline /></MarkButton>
        <BlockButton block={ORDERED_LIST}><ListOl /></BlockButton>
        <BlockButton block={UNORDERED_LIST}><ListUl /></BlockButton>
        <BlockButton block={HEADING_ONE}><TypeH1 /></BlockButton>
        <BlockButton block={HEADING_TWO}><TypeH2 /></BlockButton>
    </>
}

export { Toolbar }