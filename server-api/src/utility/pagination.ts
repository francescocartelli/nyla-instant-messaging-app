import { CreatePageEndpoint } from "./navigation.ts"

export const parsePageNumber = (p: string) => {
    const page = parseInt(p)
    if (page < 1) throw new TypeError("Page number has to be equal or higher than one")
    return isNaN(page) ? 1 : page
}

export const createPage = <T>(page: number, nPages: number, items: T, getNavigation: CreatePageEndpoint) => ({
    page: page,
    nPages: nPages,
    ...items,
    prev: page > 1 ? getNavigation(page - 1) : null,
    next: page < nPages ? getNavigation(page + 1) : null
})

export interface PageCursor {
    items: any
    nextCursor: string | null
    next: string | null
}

export const createPageCursor = ({ items, nextCursor, next }: PageCursor): PageCursor => ({
    ...items,
    nextCursor,
    next: next || null
})