import path from 'path'
import cors from 'cors'
import express from 'express'
import { createServer } from 'node:http'

import { codeblockRoutes } from './api/codeblock/codeblock.routes.js'
import { setupSocketAPI } from './services/socket.service.js'

const port = process.env.PORT || 3030
const app = express()
const server = createServer(app)

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve('public')))
} else {
    const corsOptions = {
        origin: ['http://127.0.0.1:3000', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://localhost:5173'],
        credentials: true,
    }
    app.use(cors(corsOptions))
}

setupSocketAPI(server)
app.use(express.json())
app.use('/api/codeblock', codeblockRoutes)

app.get('/**', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})

server.listen(port, () => console.log(`Server is running on port ${port}`))
