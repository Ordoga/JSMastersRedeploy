export const utilService = {
    generateId,
    splitCodeblocksByLevel,
}

function generateId(length = 5) {
    const keys = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'.split('')
    let newId = ''
    for (let i = 0; i < length; i++) {
        newId += keys[Math.floor(Math.random() * keys.length)]
    }
    return newId
}

function splitCodeblocksByLevel(codeblocks) {
    const levelMapping = { 1: 'Easy', 2: 'Medium', 3: 'Hard' }

    const groupedCodeblocks = codeblocks.reduce((acc, codeblock) => {
        const levelLabel = levelMapping[codeblock.level]

        if (!acc[levelLabel]) {
            acc[levelLabel] = []
        }

        acc[levelLabel].push({
            ...codeblock,
            level: levelLabel, // Update the level field
        })

        return acc
    }, {})
    return groupedCodeblocks
}
