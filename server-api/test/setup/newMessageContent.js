const newMessageContent = text => ({
    content: [
        {
            type: 'paragraph',
            children: [
                {
                    text
                }
            ]
        }
    ]
})

module.exports = newMessageContent