import express from 'express'
import { getCodeblocks, getCodeblock } from './codeblock.controller.js'

const router = express.Router()

router.get('/', getCodeblocks)
router.get('/:codeblockId', getCodeblock)

export const codeblockRoutes = router
