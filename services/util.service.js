export const utilService = {
    generateId,
}

function generateId(length = 5) {
    const keys = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'.split('')
    let newId = ''
    for (let i = 0; i < length; i++) {
        newId += keys[Math.floor(Math.random() * keys.length)]
    }
    return newId
}
