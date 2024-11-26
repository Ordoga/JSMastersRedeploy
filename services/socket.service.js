import { Server } from 'socket.io'

let gIo = null

let roomState = {}

export function setupSocketAPI(server) {
    gIo = new Server(server, {
        cors: {
            origin: '*',
        },
    })

    gIo.on('connection', socket => {
        socket.on('entered-codeblock-page', data => {
            // Sets user to specific room
            socket.join(data.codeblockId)
            socket.room = data.codeblockId
            socket.isMentor = false
            // Room is initialized
            if (roomState[data.codeblockId]) {
                // Room is empty
            } else {
                roomState[data.codeblockId] = []
                socket.isMentor = true
            }
            socket.emit('set-role', socket.isMentor)
        })

        socket.on('changed-code', newCode => {
            socket.broadcast.to(socket.room).emit('update-code', newCode)
        })

        socket.on('disconnect', socket => {
            console.log(`socket disconnected`)
        })
    })
}
