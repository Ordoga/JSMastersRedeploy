import { logger } from '../../services/logger.service.js'
import { utilService } from '../../services/util.service.js'
import { codeblockService } from './codeblock.service.js'

export async function getCodeblocks(req, res) {
    try {
        const codeblocks = await codeblockService.query()
        res.status(200).send(codeblocks)
    } catch (err) {
        logger.error('Failed to get codeblocks', err)
        res.status(500).send(err)
    }
}

export async function getCodeblocksByLevel(req, res) {
    try {
        const codeblocks = await codeblockService.query()
        const codeblocksByLevel = utilService.splitCodeblocksByLevel(codeblocks)
        res.status(200).send(codeblocksByLevel)
    } catch (err) {
        logger.error('Failed to get codeblocks by level', err)
        res.status(500).send(err)
    }
}

export async function getCodeblock(req, res) {
    try {
        const codeblockId = req.params.codeblockId
        const codeblock = await codeblockService.getCodeblockById(codeblockId)
        res.status(200).send(codeblock)
    } catch (err) {
        logger.error('Failed to get codeblock', err)
        res.status(500).send(err)
    }
}
