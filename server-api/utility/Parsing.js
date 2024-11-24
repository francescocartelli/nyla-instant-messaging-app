const translations = {
    'true': true,
    'false': false,
    'null': null
}

exports.parseBool = value => value?.toLowerCase ? translations[value.toLowerCase()] : value
exports.parseNull = value => value === "null" ? null : value