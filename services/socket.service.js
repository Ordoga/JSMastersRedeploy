import { Server } from 'socket.io'
import { codeblockService } from '../api/codeblock/codeblock.service.js'

let gIo = null

// TODO Extract to a service
const codeblocks = await codeblockService.query()
let codesAndSolutions = codeblockService.getCodesAndSolutions(codeblocks)
let activeRooms = codeblockService.getDefaultActiveRooms(codeblocks)
let currentCodes = {}
let debounceTimers = {}

function sendUserCountByRoom(roomId) {
    const userCount = gIo.sockets.adapter.rooms.get(roomId)?.size || 0
    gIo.to(roomId).emit('set-users-in-room', userCount)
}

export function setupSocketAPI(server) {
    gIo = new Server(server, {
        cors: {
            origin: '*',
        },
    })

    gIo.on('connection', socket => {
        socket.on('setup-socket', ({ nickname }) => {
            socket.isMentor = false
        })

        socket.on('enter-codeblock-page', ({ codeblockId }) => {
            if (socket.room) {
                socket.leave(socket.room)
            }
            socket.join(codeblockId)

            socket.room = codeblockId
            // Mentor enters - Initalize Room
            if (!activeRooms[codeblockId]) {
                activeRooms[codeblockId] = true
                currentCodes[codeblockId] = codesAndSolutions[codeblockId].initialCode

                socket.isMentor = true
                gIo.emit('set-active-rooms', activeRooms)
            }

            sendUserCountByRoom(codeblockId)
            socket.emit('update-code', currentCodes[codeblockId])
            socket.emit('set-role', socket.isMentor)
        })

        socket.on('enter-lobby', () => {
            // If mentor went to lobby from a codeblock room
            if (socket.isMentor && socket.room) {
                socket.broadcast.to(socket.room).emit('mentor-left')
                activeRooms[socket.room] = false
                delete currentCodes[socket.room]
            } else {
                // Student exited to lobby from codeblock by himself
                if (socket.room) {
                    sendUserCountByRoom(socket.room)
                }
            }

            if (socket.room) {
                socket.leave(socket.room)
                delete socket.room
            }
            socket.isMentor = false
            gIo.emit('set-active-rooms', activeRooms)

            // Reset Mentorship
            delete socket.isMentor
        })

        // Move debounce to client ?
        socket.on('changed-code', ({ newCode, codeblockId }) => {
            currentCodes[codeblockId] = newCode
            // Clear the previous debounce timer for this room
            if (debounceTimers[socket.room]) {
                clearTimeout(debounceTimers[socket.room])
            }
            debounceTimers[socket.room] = setTimeout(() => {
                socket.broadcast.to(socket.room).emit('update-code', newCode)
                if (newCode === codesAndSolutions[socket.room].solution) {
                    gIo.to(socket.room).emit('problem-solved')
                }
            }, 100)
        })

        socket.on('reset-code', ({ codeblockId }) => {
            if (!socket.isMentor) return
            currentCodes[codeblockId] = codesAndSolutions[codeblockId].initialCode
            socket.broadcast.to(codeblockId).emit('update-code', currentCodes[codeblockId])
        })

        socket.on('disconnect', () => {
            if (socket.isMentor) {
                socket.broadcast.to(socket.room).emit('mentor-left')
                activeRooms[socket.room] = false
            }
            gIo.emit('set-active-rooms', activeRooms)
            sendUserCountByRoom(socket.room)
        })
    })
}
