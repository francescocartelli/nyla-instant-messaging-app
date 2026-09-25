import { DeleteResult, UpdateResult } from "mongodb"

interface EvaluatedResult {
    total: number
    success: number
    failed: number
}

const getCount = (result: UpdateResult | DeleteResult) => {
    return ((result as UpdateResult).modifiedCount ?? 0) + ((result as DeleteResult).deletedCount ?? 0)
}

export const evaluateModifiedResults = (results: Array<UpdateResult | DeleteResult>): EvaluatedResult => {
    const total = results.length
    const success = results.reduce((acc, result) => acc + getCount(result), 0)
    const failed = total - success

    return {
        total,
        success,
        failed
    }
}