export type Node = {
    text?: string
    children?: Node[]
}

type FlatNode = (node: Node) => string[] | string | undefined

const flatNode: FlatNode = ({ text, children }) => {
    if (text) return [text]
    else if (children && children.length > 0) return children.map(flatNode).join("") + "\n"
}

export const flatRTNodes = (nodes: Array<Node>) => nodes.map(flatNode).join("").trim()