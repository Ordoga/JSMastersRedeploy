import { codeblockService } from './codeblock.service.js'

export async function getCodeblocks(req, res) {
    const codeblocks = await codeblockService.query()
    res.status(200).send(codeblocks)
}

export async function getCodeblock(req, res) {
    const codeblockId = req.params.codeblockId
    const codeblock = await codeblockService.getCodeblockById(codeblockId)
    res.status(200).send(codeblock)
}
