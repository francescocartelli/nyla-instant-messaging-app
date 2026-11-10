import fs from 'fs'
import { Node } from './richtext.ts'

const guide = fs.readFileSync('./chat-guide.md', { encoding: 'utf8', flag: 'r' })

type Prompt = (text: string) => string

export type Message = {
    idSender: string
    sender: string
    content: Node[]
    createdAt: string
    deletedAt: string
}

export type PromptableMessage = Pick<Message, 'createdAt' | 'deletedAt'> & {
    sender: string
    content: string | null
}

type MessageToPromp = (message: PromptableMessage) => string

const role = `you are a chatbot of a chat application
users can ask you anything
give brief and precise aswers to their questions
you are supposed to help but not other requests`

export const assistancePrompt: Prompt = text => `${role}

always keep the guide in mind:
=== START ===
${guide}
=== FINISH ===

here is the user message:
=== START ===
${text}
=== FINISH ===
`

export const assistanceWithHistoryPrompt: Prompt = history => `${role}

always keep the guide in mind:
=== START ===
${guide}
=== FINISH ===

the last messages are the following in chronological order:
=== START ===
${history}
=== FINISH ===
`

export const messageToPrompt: MessageToPromp = ({ sender, content, createdAt, deletedAt }) => `sent by ${sender} at ${createdAt}:
${deletedAt ? '<this message had been deleted>' : content}
---`