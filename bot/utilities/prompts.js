const fs = require('fs')

const guide = fs.readFileSync('./chat-guide.md', { encoding: 'utf8', flag: 'r' })

const role = `you are a chatbot of a chat application
users can ask you anything
give brief and precise aswers to their questions
you are supposed to help but not other requests`

const assistancePrompt = text => `${role}

always keep the guide in mind:
=== START ===
${guide}
=== FINISH ===

here is the user message:
=== START ===
${text}
=== FINISH ===
`

const assistanceWithHistoryPrompt = history => `${role}

always keep the guide in mind:
=== START ===
${guide}
=== FINISH ===

the last messages are the following in chronological order:
=== START ===
${history}
=== FINISH ===
`

const messageToPrompt = ({ sender, content, createdAt, deletedAt }) => `sent by ${sender} at ${createdAt}:
${deletedAt ? '<this message had been deleted>' : content}
---`

exports.assistancePrompt = assistancePrompt
exports.assistanceWithHistoryPrompt = assistanceWithHistoryPrompt

exports.messageToPrompt = messageToPrompt