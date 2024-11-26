import express from 'express'
import { createServer } from 'node:http'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import path from 'path'

import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { codeblockRoutes } from './api/codeblock/codeblock.routes.js'

const port = process.env.PORT || 3030

const app = express()
const server = createServer(app)
app.use(express.static(path.resolve('public')))

// if (process.env.NODE_ENV === 'production') {
//     app.use(express.static(path.resolve('public')))
// } else {
//     const corsOptions = {
//         origin: ['http://127.0.0.1:5173', 'http://localhost:5173'],
//         credentials: true,
//     }
//     app.use(cors(corsOptions))
// }
// app.get('/**', (req, res) => {
//     res.sendFile(path.resolve('public/index.html'))
// })

app.use(express.json())
app.use(cookieParser())
app.use('/api/codeblock', codeblockRoutes)

const __dirname = dirname(fileURLToPath(import.meta.url))

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'public/index.html'))
})

server.listen(port, () => console.log(`Server is running on port ${port}`))
