import express from 'express'
import { getCodeblocks } from './codeblock.controller.js'

const router = express.Router()

router.get('/', getCodeblocks)

export const codeblockRoutes = router
