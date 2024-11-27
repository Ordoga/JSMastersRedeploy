import { ObjectId } from 'mongodb'
import { dbService } from '../../services/db.service.js'

const COLLECTION_NAME = 'codeblock'

export const codeblockService = {
    query,
    getCodeblockById,
    getSolutions,
}

async function query() {
    const collection = await dbService.getCollection(COLLECTION_NAME)
    const codeblocks = await collection.find().toArray()
    return codeblocks
}

async function getCodeblockById(codeblockId) {
    const collection = await dbService.getCollection(COLLECTION_NAME)
    const codeblock = await collection.findOne({ _id: ObjectId.createFromHexString(codeblockId) })
    delete codeblock.solution
    return codeblock
}

async function getSolutions() {
    const codeblocks = await query()
    let solutions = {}
    codeblocks.forEach(({ _id, solution, level }) => {
        solutions[_id] = { solution, level }
    })
    return solutions
}
