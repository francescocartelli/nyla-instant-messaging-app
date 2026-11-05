const parseNull = (input: string): null | any => input?.toString?.().trim?.().toLowerCase?.() === 'null' ? null : input

export default parseNull