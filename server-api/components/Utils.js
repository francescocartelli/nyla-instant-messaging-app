exports.parseBool = (b) => {
    if (b === undefined || b === null || b === 'null') return null
    else return b.toLowerCase?.() === 'true'
}