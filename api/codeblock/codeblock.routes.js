import express from 'express'
import { getCodeblock, getCodeblocksByLevel } from './codeblock.controller.js'

const router = express.Router()

router.get('/', getCodeblocksByLevel)
router.get('/:codeblockId', getCodeblock)

export const codeblockRoutes = router
