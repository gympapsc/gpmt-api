const request = require("supertest")
const express = require("express")
const mongoose = require("mongoose")
const seedDatabase = require("../seed")
const storageAccount = require("../storage")
const { Buffer } = require("buffer")

const dataRouter = require("./data")
const tar = require("tar")
const {
    PhotoClassificationModel,
    User,
    MicturitionModel
} = require("../models")


describe("/admin/data", () => {
    const app = express()
    let admin

    beforeAll(async () => {
        // connect to mongodb
        await mongoose.connect(process.env.MONGO_URL, {
            useCreateIndex: true,
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        await mongoose.connection.db.dropDatabase()
        // seed database
        await seedDatabase()

        admin = await User.findOne({role: "admin", email: "hakim@admin.com"})

        app.use(express.json())
        app.use(async (req, res, next) => {
            req.user = admin
            next()
        })
        app.use(dataRouter)
    })

    afterAll(async () => {
        // disconnect from mongodb
        await mongoose.connection.close()
    })

    afterEach(async () => {
        await mongoose.connection.db.dropDatabase()
        // seed database
        await seedDatabase()
    })

    it("should get all users", async () => {
        let users = await User.find({})

        let res = await request(app)
            .get("/users")
            .expect("Content-Type", /json/)
            .expect(200)
        
        expect(JSON.parse(JSON.stringify(res.body.users))).toEqual(JSON.parse(JSON.stringify(users)))
    })

    it("should get all forecasting models", async () => {
        await MicturitionModel.create({
            active: false
        })

        let models = await MicturitionModel.find({})

        let res = await request(app)
            .get("/model")
            .expect("Content-Type", /json/)
            .expect(200)
        
        expect(JSON.parse(JSON.stringify(res.body.models))).toEqual(JSON.parse(JSON.stringify(models)))
    })

    it("should create forecasting model", async () => {
        let res = await request(app)
            .post("/model")
            .attach("model", Buffer.from("test"), "test_model.txt")
            .set("Content-Type", "multipart/form-data")
            .expect("Content-Type", /json/)
            .expect(200)
        
        let model_id = res.body.model._id
        let count = await MicturitionModel.countDocuments({ _id: model_id })
        expect(count).toBe(1)

        const forecastModelContainerClient = await storageAccount("forecast-models")
        let blobList =  forecastModelContainerClient.list()
        let names = []
        for await (let blob of blobList) {
            names.push(blob.name)
        }

        expect(names).toContainEqual(model_id)
    })

    it("should delete forecasting model", async () => {
        let model = await MicturitionModel.create({
            active: false
        })

        let res = await request(app)
            .delete(`/model/${model._id}`)
            .expect("Content-Type", /json/)
            .expect(200)

        expect(res.body.ok).toEqual(true)

        let count = await MicturitionModel.countDocuments({ _id: model._id })
        expect(count).toEqual(0)
    })

    it("should activate forecasting model", async () => {
        let model = await MicturitionModel.create({
            active: false
        })

        let res = await request(app)
            .post(`/model/${model._id}/activate`)
            .expect("Content-Type", /json/)
            .expect(200)
            
        expect(res.body.ok).toEqual(true)

        model = await MicturitionModel.findOne({
            _id: model._id
        })

        expect(model.active).toBe(true)
    })

    it("should export health data in csv format", async () => {
        let res = await request(app)
            .get("/export/csv")
            .expect("Content-Disposition", /attachment/)
            .expect(200)
    })

})