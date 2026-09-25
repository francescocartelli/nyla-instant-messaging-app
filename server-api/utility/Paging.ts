export const parsePageNumber = (p) => {
    const page = parseInt(p)
    if (page < 1) throw new TypeError("Page number has to be equal or higher than one")
    return isNaN(page) ? 1 : page
}

export const createPage = (page, nPages, items, getNavigation) => ({
    page: page,
    nPages: nPages,
    ...items,
    prev: page > 1 ? getNavigation(page - 1) : null,
    next: page < nPages ? getNavigation(page + 1) : null
})

export const createPageCursor = ({ items, nextCursor, next }) => ({
    ...items,
    nextCursor,
    next: next || null
})