import { logger } from '../../services/logger.service.js'
import { codeblockService } from './codeblock.service.js'

export async function getCodeblocks(req, res) {
    try {
        const codeblocks = await codeblockService.query()
        const codeblocksWithActiveState = codeblocks.map(codeblock => ({ ...codeblock, active: false }))
        res.status(200).send(codeblocksWithActiveState)
    } catch (err) {
        logger.error('Failed to get codeblocks', err)
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
