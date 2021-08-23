const storage = require("./storage")

describe("storage api", () => {
    let storageClient

    beforeEach(async () => {
        storageClient = await storage("test")

        for await(let blob of storageClient.list()) {
            await storageClient.deleteIfExists(blob.name)
        }
    })

    it("should create client", async () => {
        storageClient = await storage("test")

        expect(storageClient).toBeDefined()
    })

    it("should upload and read buffer", async () => {
        storageClient = await storage("test")

        let buffer = Buffer.from("Hello World")
        await storageClient.upload("hello_world", buffer, buffer.length)

        let blobNames = []
        for await(let blob of storageClient.list()) {
            blobNames.push(blob.name)
        }
        expect(blobNames).toContainEqual("hello_world")

        let body = await storageClient.readtoBuffer("hello_world")
        expect(body.toString()).toEqual("Hello World")
    })

    it("should upload and read string", async () => {
        storageClient = await storage("test")

        let buffer = Buffer.from("Hello World")
        await storageClient.upload("hello_world", buffer, buffer.length)

        let blobNames = []
        for await(let blob of storageClient.list()) {
            blobNames.push(blob.name)
        }
        expect(blobNames).toContainEqual("hello_world")

        let body = await storageClient.readtoString("hello_world")
        expect(body).toEqual("Hello World")
    })

    it("should upload and delete blob if exists", async () => {
        storageClient = await storage("test")
        let buffer = Buffer.from("Hello World")
        await storageClient.upload("hello_world", buffer, buffer.length)
        let blobNames = []
        for await(let blob of storageClient.list()) {
            blobNames.push(blob.name)
        }
        expect(blobNames).toContainEqual("hello_world")

        // exists
        await storageClient.deleteIfExists("hello_world")
        // blob does not exist
        await storageClient.deleteIfExists("hello world")


        blobNames = []
        for await(let blob of storageClient.list()) {
            blobNames.push(blob.name)
        }
        expect(blobNames).not.toContainEqual("hello_world")
        expect(blobNames.length).toBe(0)
    })

})