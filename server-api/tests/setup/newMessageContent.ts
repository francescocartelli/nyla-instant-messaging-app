const newMessageContent = (text: string) => ({
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