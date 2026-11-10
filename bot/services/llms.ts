type Options = {
    endpoint: string
    secret?: string
    model?: string
}

type CreateEndpoint = (options: Options, fetchFunction: (
    ...args: Parameters<typeof fetch>
) => Promise<Response | null>) => (text: string) => Promise<string | null>

const createGeminiEndpoint: CreateEndpoint = ({
    endpoint,
    secret
}, fetchFunction = fetch) => async text => {
    const res = await fetchFunction(endpoint, {
        method: 'POST',
        headers: {
            ...(secret && { 'x-goog-api-key': secret }),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ contents: [{ parts: [{ text }] }] })
    })

    if (!res || !res.ok) return null

    const data = await res.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text
}

const createOpenAIEndpoint: CreateEndpoint = ({
    endpoint,
    secret,
    model
}, fetchFunction = fetch) => async text => {
    const res = await fetchFunction(endpoint, {
        method: 'POST',
        headers: {
            ...(secret && { 'Authorization': `Bearer ${secret}` }),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model,
            messages: [{ role: "user", content: text }],
        }),
    })

    if (!res || !res.ok) return null

    const data = await res.json()
    return data.choices?.[0]?.message?.content
}

const createAnthropicEndpoint: CreateEndpoint = ({
    endpoint,
    secret,
    model
}, fetchFunction = fetch) => async text => {
    const res = await fetchFunction(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(secret && { 'x-api-key': secret }),
        },
        body: JSON.stringify({
            model,
            max_tokens: 1024,
            messages: [{ role: "user", content: text }],
        }),
    })

    if (!res || !res.ok) return null

    const data = await res.json()
    return data.content?.[0]?.text
}

const createOllamaEndpoint: CreateEndpoint = ({
    endpoint,
    model
}, fetchFunction = fetch) => async text => {
    const res = await fetchFunction(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: text }],
            stream: false
        })
    })

    if (!res || !res.ok) return null

    const data = await res.json()
    return data.message?.content || null
}

export const providerEndpoints: Record<string, CreateEndpoint> = {
    gemini: createGeminiEndpoint,
    openai: createOpenAIEndpoint,
    anthropic: createAnthropicEndpoint,
    ollama: createOllamaEndpoint
}