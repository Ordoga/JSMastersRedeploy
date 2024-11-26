import { Server } from 'socket.io'

var gIo = null

export function setupSocketAPI(server) {
    gIo = new Server(server, {
        cors: {
            origin: '*',
        },
    })
    gIo.on('connection', socket => {
        gIo.emit('user-connected', 'A user Has Connected')

        socket.on('disconnect', socket => {
            console.log(`socket with fullname ${socket.name} disconnected`)
        })
    })
}
