interface Navigation {
    asc?: boolean
    isGroup?: boolean
}

export type CreatePageEndpoint = (page: number) => string

export const getChatNavigation = ({ asc, isGroup }: Navigation): CreatePageEndpoint => {
    const endpoint = "/api/chats/personal"
    const params = `&asc=${asc}&isGroup=${isGroup}`

    return (page: number) => `${endpoint}?page=${page}${params}`
}

export const getMessageNavigation = (idChat: string, next: string) => `/api/chats/${idChat}/messages?cursor=${next}`