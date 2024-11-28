import { ObjectId } from 'mongodb'
import { dbService } from '../../services/db.service.js'

const COLLECTION_NAME = 'codeblock'

export const codeblockService = {
    query,
    getCodeblockById,
    getCodesAndSolutions,
    getDefaultActiveRooms,
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

function getCodesAndSolutions(codeblocks) {
    let codesAndSolutions = {}
    codeblocks.forEach(({ _id, solution, initialCode }) => {
        codesAndSolutions[_id] = { solution, initialCode }
    })
    return codesAndSolutions
}

function getDefaultActiveRooms(codeblocks) {
    let activeRooms = {}
    codeblocks.forEach(({ _id }) => {
        activeRooms[_id] = false
    })
    return activeRooms
}
