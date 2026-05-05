const createGeminiEndpoint = ({
    endpoint,
    secret
}, fetchFunction = fetch) => async text => {
    const res = await fetchFunction(endpoint, {
        method: "POST",
        headers: {
            'x-goog-api-key': secret,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contents: [{ parts: [{ text }] }] })
    })

    if (!res.ok) return null

    const data = await res.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text
}

exports.createGeminiEndpoint = createGeminiEndpoint