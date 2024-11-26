import { Server } from 'socket.io'
import { codeblockService } from '../api/codeblock/codeblock.service.js'

let gIo = null

let roomState = {}

let solutions = await codeblockService.getSolutions()
console.log(solutions)

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

            if (newCode === solutions[socket.room]) {
                gIo.to(socket.room).emit('problem-solved')
            }
        })

        socket.on('disconnect', () => {
            console.log(`socket of role ${socket.isMentor ? 'Mentor' : 'Student'} disconnected`)

            if (socket.isMentor) {
                socket.broadcast.to(socket.room).emit('mentor-left')
                delete roomState[socket.room]
            }
        })
    })
}
