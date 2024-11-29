import { Server } from 'socket.io'
import { logger } from './logger.service.js'
import { codeblockService } from '../api/codeblock/codeblock.service.js'

export const SOCKET_EVENT_ENTER_LOBBY = 'enter-lobby'
export const SOCKET_EVENT_ENTER_CODEBLOCK_PAGE = 'enter-codeblock-page'
export const SOCKET_EVENT_CODE_CHANGED = 'code-changed'

export const SOCKET_EVENT_UPDATE_CODE = 'update-code'
export const SOCKET_EVENT_SET_ROLE = 'set-role'
export const SOCKET_EVENT_SET_USERS_IN_ROOM = 'set-users-in-room'
export const SOCKET_EVENT_MENTOR_LEFT = 'mentor-left'
export const SOCKET_EVENT_PROBLEM_SOLVED = 'problem-solved'
export const SOCKET_EVENT_RESET_CODE = 'reset-code'

let gIo = null

// Gets codes for comparing solutions and resetting code
let codesAndSolutions = await codeblockService.getCodesAndSolutions()
let activeRooms = new Set()
let currentCodes = {}
let debounceTimers = {}

export function setupSocketAPI(server) {
    gIo = new Server(server, {
        cors: {
            origin: '*',
        },
    })

    gIo.on('connection', socket => {
        logger.info('New user connected')
        socket.on(SOCKET_EVENT_ENTER_CODEBLOCK_PAGE, ({ codeblockId }) => {
            if (socket.room) {
                socket.leave(socket.room)
            }
            socket.join(codeblockId)
            socket.room = codeblockId
            // Mentor enters - Initalize Room
            if (!activeRooms.has(codeblockId)) {
                activeRooms.add(codeblockId)
                currentCodes[codeblockId] = codesAndSolutions[codeblockId].initialCode
                socket.isMentor = true
                logger.info(`Mentor initiated room ${codeblockId}`)
            } else {
                socket.emit(SOCKET_EVENT_UPDATE_CODE, currentCodes[codeblockId])
                logger.info(`Student entered room ${codeblockId}`)
            }
            _sendUserCountByRoom(codeblockId)
            socket.emit(SOCKET_EVENT_SET_ROLE, socket.isMentor)
        })

        socket.on(SOCKET_EVENT_ENTER_LOBBY, () => {
            const roomNavigatedFrom = socket.room
            // Exited to lobby from a codeblock room
            if (roomNavigatedFrom) {
                if (socket.isMentor) {
                    activeRooms.delete(roomNavigatedFrom)
                    // Navigates students to lobby and emits enter-lobby event on client
                    socket.broadcast.to(roomNavigatedFrom).emit(SOCKET_EVENT_MENTOR_LEFT)
                    _addExpelledTag(roomNavigatedFrom)
                    delete currentCodes.roomNavigatedFrom
                }
                socket.leave(roomNavigatedFrom)
                delete socket.room
                // Only emit new userCount if socket exited manually
                if (!socket.expelled) {
                    _sendUserCountByRoom(roomNavigatedFrom)
                }
            }
            // Reset Mentorship and expelled tag with each enter to Lobby
            socket.expelled = false
            socket.isMentor = false
        })

        socket.on(SOCKET_EVENT_CODE_CHANGED, ({ newCode, codeblockId }) => {
            currentCodes[codeblockId] = newCode
            // Clear the previous debounce timer for this room
            if (debounceTimers[socket.room]) {
                clearTimeout(debounceTimers[socket.room])
            }
            // Only emit code change and execute solution check if no changed
            debounceTimers[socket.room] = setTimeout(() => {
                socket.broadcast.to(socket.room).emit(SOCKET_EVENT_UPDATE_CODE, newCode)
                if (newCode === codesAndSolutions[socket.room].solution) {
                    gIo.to(socket.room).emit(SOCKET_EVENT_PROBLEM_SOLVED)
                    logger.info(`Problem solved in room ${socket.room}`)
                }
            }, 250)
        })

        socket.on(SOCKET_EVENT_RESET_CODE, ({ codeblockId }) => {
            if (!socket.isMentor) return
            currentCodes[codeblockId] = codesAndSolutions[codeblockId].initialCode
            socket.broadcast.to(codeblockId).emit(SOCKET_EVENT_UPDATE_CODE, currentCodes[codeblockId])
        })

        socket.on('disconnect', () => {
            if (socket.isMentor) {
                socket.broadcast.to(socket.room).emit(SOCKET_EVENT_MENTOR_LEFT)
                activeRooms.delete(socket.room)
            } else {
                _sendUserCountByRoom(socket.room)
            }
        })
    })
}

function _sendUserCountByRoom(roomId) {
    const userCount = gIo.sockets.adapter.rooms.get(roomId)?.size || 0
    gIo.to(roomId).emit(SOCKET_EVENT_SET_USERS_IN_ROOM, userCount)
}

function _addExpelledTag(codeblockId) {
    const roomName = codeblockId
    const room = gIo.sockets.adapter.rooms.get(roomName)
    if (room) {
        for (const socketId of room) {
            const socket = gIo.sockets.sockets.get(socketId)
            if (socket) {
                socket.expelled = true
            }
        }
    }
}
