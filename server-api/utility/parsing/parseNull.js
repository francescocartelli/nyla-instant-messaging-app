const parseNull = input => input?.toString?.().trim?.().toLowerCase?.() === 'null' ? null : input

export default parseNull