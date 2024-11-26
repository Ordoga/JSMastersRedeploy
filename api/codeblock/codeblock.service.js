import { ObjectId } from 'mongodb'
import { dbService } from '../../services/db.service.js'

const COLLECTION_NAME = 'codeblock'

export const codeblockService = {
    query,
    getCodeblockById,
}

async function query() {
    const collection = await dbService.getCollection(COLLECTION_NAME)
    const codeblocks = await collection.find().toArray()
    return codeblocks
}

async function getCodeblockById(codeblockId) {
    const collection = await dbService.getCollection(COLLECTION_NAME)
    const codeblock = await collection.findOne({ _id: ObjectId.createFromHexString(codeblockId) })
    return codeblock
}
