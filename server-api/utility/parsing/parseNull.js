const parseNull = input => input?.toString?.().trim?.().toLowerCase?.() === 'null' ? null : input

module.exports = parseNull