const evaluateModifiedResults = results => {
    const total = results.length
    const success = results.reduce((acc, result) => acc + ((result.modifiedCount || result.deletedCount) > 0 && 1), 0)
    const failed = total - success

    return {
        total,
        success,
        failed
    }
}

exports.evaluateModifiedResults = evaluateModifiedResults