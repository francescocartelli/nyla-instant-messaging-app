const createGeminiEndpoint = ({
    endpoint,
    secret
}, fetchFunction = fetch) => async text => {
    const res = await fetchFunction(endpoint, {
        method: 'POST',
        headers: {
            'x-goog-api-key': secret,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ contents: [{ parts: [{ text }] }] })
    })

    if (!res.ok) return null

    const data = await res.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text
}

const createOpenAIEndpoint = ({
    endpoint,
    secret,
    model
}, fetchFunction = fetch) => async text => {
    const res = await fetchFunction(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${secret}`
        },
        body: JSON.stringify({
            model,
            messages: [{ role: "user", content: text }],
        }),
    })

    if (!res.ok) return null

    const data = await res.json()
    return data.choices?.[0]?.message?.content
}

const createAnthropicEndpoint = ({
    endpoint,
    secret,
    model
}, fetchFunction = fetch) => async text => {
    const res = await fetchFunction(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': secret,
        },
        body: JSON.stringify({
            model,
            max_tokens: 1024,
            messages: [{ role: "user", content: text }],
        }),
    })

    if (!res.ok) return null

    const data = await res.json()
    return data.content?.[0]?.text
}

const providerEndpoints = {
    gemini: createGeminiEndpoint,
    openai: createOpenAIEndpoint,
    anthropic: createAnthropicEndpoint
}

exports.providerEndpoints = providerEndpoints