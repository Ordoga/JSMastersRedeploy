import { Server } from 'socket.io'
import { codeblockService } from '../api/codeblock/codeblock.service.js'

let gIo = null

let roomState = {}

let solutions = await codeblockService.getSolutions()

export function setupSocketAPI(server) {
    gIo = new Server(server, {
        cors: {
            origin: '*',
        },
    })

    gIo.on('connection', socket => {
        socket.on('setup-socket', ({ nickname }) => {
            socket.nickname = nickname
            socket.score = 0
        })

        socket.on('entered-codeblock-page', ({ codeblockId }) => {
            if (socket.room) {
                // Came straight from another room
                socket.leave(socket.room)
            }
            socket.join(codeblockId)
            socket.room = codeblockId
        })

        socket.on('return-lobby', () => {
            socket.leave(socket.room)
            delete socket.room
            delete socket.isMentor
        })

        socket.on('disconnect', () => {
            console.log(`socket of role ${socket.isMentor ? 'Mentor' : 'Student'} disconnected`)

            if (socket.isMentor) {
                socket.broadcast.to(socket.room).emit('mentor-left')
                delete roomState[socket.room]
            }
        })

        socket.on('changed-code', newCode => {
            socket.broadcast.to(socket.room).emit('update-code', newCode)

            if (newCode === solutions[socket.room].solution) {
                gIo.to(socket.room).emit('problem-solved')
                socket.score += 100 * solutions[socket.room].level
                console.log(socket.score)
            }
        })
    })
}

// // If Mentor Changed from room to room,
// if (socket.isMentor && socket.room) {
//     socket.broadcast.to(socket.room).emit('mentor-left')
// }

// if (socket.room) {
//     socket.leave(socket.room)
// }

// socket.join(codeblockId)
// socket.room = codeblockId
// socket.isMentor = false

// if (roomState[codeblockId]) {
//     // Room is initialized
// } else {
//     // Room is empty
//     roomState[codeblockId] = []
//     socket.isMentor = true
// }
// socket.emit('set-role', socket.isMentor)
