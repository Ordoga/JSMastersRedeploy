import { codeblockService } from './codeblock.service.js'

export async function getCodeblocks(req, res) {
    const codeblocks = await codeblockService.query()
    res.status(200).send(codeblocks)
}
