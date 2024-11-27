import { Server } from 'socket.io'
import { codeblockService } from '../api/codeblock/codeblock.service.js'
import { utilService } from './util.service.js'

let gIo = null

let activeRooms = {}
let connectedUsers = []
let debounceTimers = {}

let solutions = await codeblockService.getSolutions()

export function setupSocketAPI(server) {
    gIo = new Server(server, {
        cors: {
            origin: '*',
        },
    })

    gIo.on('connection', socket => {
        socket.on('setup-socket', ({ nickname }) => {
            socket.userData = { nickname, score: 0, id: utilService.generateId() }
            connectedUsers.push(socket.userData)
            socket.emit('set-user-data', socket.userData)
            gIo.emit('set-connected-users', connectedUsers)
        })

        socket.on('enter-codeblock-page', ({ codeblockId }) => {
            // console.log(`user with id ${socket.userData.id} have entered the room`)

            if (socket.room) {
                // Came straight from another room
                socket.leave(socket.room)
            }
            socket.join(codeblockId)
            socket.room = codeblockId
            socket.isMentor = false
            // Mentor enters - Initalize Room
            if (!activeRooms[codeblockId]) {
                activeRooms[codeblockId] = []
                socket.isMentor = true
            } else {
                activeRooms[codeblockId].push(socket.userData)
            }
            socket.emit('set-role', socket.isMentor)
            socket.emit('set-connected-users', activeRooms[codeblockId])
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
                delete activeRooms[socket.room]
            }
        })

        socket.on('changed-code', newCode => {
            socket.broadcast.to(socket.room).emit('update-code', newCode)
            // Clear the previous debounce timer for this room
            if (debounceTimers[socket.room]) {
                clearTimeout(debounceTimers[socket.room])
            }

            // Set a new debounce timer
            debounceTimers[socket.room] = setTimeout(() => {
                if (newCode === solutions[socket.room].solution) {
                    // Emit problem solved to the room
                    gIo.to(socket.room).emit('problem-solved')

                    // Update the user's score
                    socket.userData.score += 100 * solutions[socket.room].level
                }
            }, 1000) // 500 milliseconds debounce time
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
