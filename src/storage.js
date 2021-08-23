const { BlobServiceClient } = require("@azure/storage-blob")

const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.STORAGE_CONNECTION_URL)

module.exports = async name =>  {
    const containerClient = blobServiceClient.getContainerClient(name)
    await containerClient.createIfNotExists()
    return {
        readtoString: async (blobName) => {
            let blockBlobClient = containerClient.getBlockBlobClient(blobName)
            return await blockBlobClient.downloadToBuffer().then(b => b.toString())
        },
        readtoBuffer: async (blobName) => {
            let blockBlobClient = containerClient.getBlockBlobClient(blobName)
            return await blockBlobClient.downloadToBuffer()
        },
        readToFile: async (blobName, path) => {
            let blockBlobClient = containerClient.getBlockBlobClient(blobName)
            await blockBlobClient.downloadToFile(path)
        },
        upload: async (blobName, data, length) => {
            let blockBlobClient = containerClient.getBlockBlobClient(blobName)
            await blockBlobClient.upload(data, length)
        },
        deleteIfExists: async (blobName) => {
            let blockBlobClient = containerClient.getBlockBlobClient(blobName)
            await blockBlobClient.deleteIfExists()
        },
        list: () => {
            return containerClient.listBlobsFlat()
        }
    }
}