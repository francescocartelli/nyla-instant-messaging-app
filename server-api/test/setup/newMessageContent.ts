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

export default newMessageContent