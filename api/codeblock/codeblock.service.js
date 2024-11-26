export const codeblockService = {
    query,
}

async function query() {
    const codeBlocks = [
        { name: 'code1', id: '1' },
        { name: 'code2', id: '2' },
        { name: 'code3', id: '3' },
    ]
    return codeBlocks
}
