import { Server } from 'socket.io'
import { codeblockService } from '../api/codeblock/codeblock.service.js'
import { utilService } from './util.service.js'

let gIo = null

const codeblocks = await codeblockService.query()
let solutions = codeblockService.getSolutions(codeblocks)
let activeRooms = codeblockService.getDefaultActiveRooms(codeblocks)
let debounceTimers = {}

export function setupSocketAPI(server) {
    gIo = new Server(server, {
        cors: {
            origin: '*',
        },
    })

    gIo.on('connection', socket => {
        socket.on('setup-socket', ({ nickname }) => {
            // socket.userData = { nickname, score: 0, id: utilService.generateId() }
            // socket.emit('set-user-data', socket.userData)
        })

        socket.on('enter-codeblock-page', ({ codeblockId }) => {
            if (socket.room) {
                // activeRooms[socket.room] = activeRooms[socket.room].filter(user => user.id !== socket.userData?.id)
                socket.leave(socket.room)
            }
            socket.join(codeblockId)
            socket.room = codeblockId
            socket.isMentor = false
            // Mentor enters - Initalize Room
            if (!activeRooms[codeblockId]) {
                activeRooms[codeblockId] = true
                socket.isMentor = true
            } else {
                activeRooms[codeblockId] = true
            }
            sendUserCountByRoom(codeblockId)
            socket.emit('set-role', socket.isMentor)
            // gIo.to(codeblockId).emit('set-connected-users', activeRooms[codeblockId])
        })

        socket.on('enter-lobby', () => {
            // If mentor went to lobby from a codeblock room
            if (socket.isMentor && socket.room) {
                socket.broadcast.to(socket.room).emit('mentor-left')
                activeRooms[socket.room] = false
            } // If anyone went to lobby from a codeblock room
            if (socket.room) {
                socket.leave(socket.room)
                sendUserCountByRoom(socket.room)
                delete socket.room
            }
            // socket.join('lobby')
            // socket.room = 'lobby'
            // activeRooms['lobby'].push(socket.userData)
            // socket.emit('set-connected-users', activeRooms['lobby'])

            // Reset Mentorship
            delete socket.isMentor
        })

        socket.on('disconnect', () => {
            if (socket.isMentor) {
                socket.broadcast.to(socket.room).emit('mentor-left')
                delete activeRooms[socket.room]
            }
            sendUserCountByRoom(socket.room)
            // else {
            //     if (activeRooms[socket.room]) {
            //         activeRooms[socket.room] = activeRooms[socket.room].filter(user => user.id !== socket.userData.id)
            //     }
            // }
        })

        // Move debounce to client ?
        socket.on('changed-code', newCode => {
            // Clear the previous debounce timer for this room
            if (debounceTimers[socket.room]) {
                clearTimeout(debounceTimers[socket.room])
            }
            debounceTimers[socket.room] = setTimeout(() => {
                socket.broadcast.to(socket.room).emit('update-code', newCode)
                if (newCode === solutions[socket.room].solution) {
                    gIo.to(socket.room).emit('problem-solved')
                    // socket.userData.score += 100 * solutions[socket.room].level
                }
            }, 100)
        })
    })
}

function sendUserCountByRoom(roomId) {
    const userCount = gIo.sockets.adapter.rooms.get(roomId)?.size || 0
    gIo.to(roomId).emit('set-users-in-room', userCount)
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
