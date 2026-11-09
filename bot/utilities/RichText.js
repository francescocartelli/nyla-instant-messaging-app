const flatNode = ({ text, children }) => {
    if (text) return [text]
    else if (children && children.length > 0) return children.map(flatNode).join("") + "\n"
}

export const flatRTNodes = (nodes) => nodes.map(flatNode).join("").trim()