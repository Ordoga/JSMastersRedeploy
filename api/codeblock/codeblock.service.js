import { ObjectId } from 'mongodb'
import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'

const COLLECTION_NAME = 'codeblock'

export const codeblockService = {
    query,
    getCodeblockById,
    getCodesAndSolutions,
    getDefaultActiveRooms,
}

async function query() {
    try {
        const collection = await dbService.getCollection(COLLECTION_NAME)
        const codeblocks = await collection.find().toArray()
        return codeblocks
    } catch (err) {
        logger.error('Failed to get codeblocks from DB', err)
        throw err
    }
}

async function getCodeblockById(codeblockId) {
    try {
        const collection = await dbService.getCollection(COLLECTION_NAME)
        const codeblock = await collection.findOne({ _id: ObjectId.createFromHexString(codeblockId) })
        delete codeblock.solution
        return codeblock
    } catch (err) {
        logger.error('Failed to get codeblock from DB', err)
        throw err
    }
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
