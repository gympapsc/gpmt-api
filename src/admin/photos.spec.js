const request = require("supertest")
const express = require("express")
const mongoose = require("mongoose")
const seedDatabase = require("../seed")
const storageAccount = require("../storage")


const photoRouter = require("./photos")
const {
    Photo,
    PhotoClassificationModel,
    User
} = require("../models")


describe("/admin/questionnaire", () => {
    const app = express()
    let user
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
        user = await User.findOne({ email: "testing@taylor.com" })

        app.use(express.json())
        app.use(async (req, res, next) => {
            req.user = admin
            next()
        })
        app.use(photoRouter)
    })

    afterAll(async () => {
        // disconnect from mongodb
        await mongoose.connection.close()
    })

    it("should get all photos", async () => {
        let photo = await Photo.create({
            user: user
        })

        let photos = await Photo.find({})

        let res = await request(app)
            .get("/")
            .expect("Content-Type", /json/)
            .expect(200)
        
        expect(JSON.parse(JSON.stringify(res.body.photos))).toEqual(JSON.parse(JSON.stringify(photos)))
    })

    it("should get all photo classification models", async () => {
        await PhotoClassificationModel.create({
            active: false
        })

        let models = await PhotoClassificationModel.find({})

        let res = await request(app)
            .get("/model")
            .expect("Content-Type", /json/)
            .expect(200)
        
        expect(JSON.parse(JSON.stringify(res.body.models))).toEqual(JSON.parse(JSON.stringify(models)))
    })

    it("should create photo classification model", async () => {
        let res = await request(app)
            .post("/model")
            .attach("model", Buffer.from("test"), "test_model.txt")
            .set("Content-Type", "multipart/form-data")
            .expect("Content-Type", /json/)
            .expect(200)
        
        let model_id = res.body.model._id
        let count = await PhotoClassificationModel.countDocuments({ _id: model_id })
        expect(count).toBe(1)

        const forecastModelContainerClient = await storageAccount("photo-models")
        let blobList =  forecastModelContainerClient.list()
        let names = []
        for await (let blob of blobList) {
            names.push(blob.name)
        }

        expect(names).toContainEqual(model_id)
    })

    it("should delete photo classification model", async () => {
        let model = await PhotoClassificationModel.create({
            active: false
        })

        let res = await request(app)
            .delete(`/model/${model._id}`)
            .expect("Content-Type", /json/)
            .expect(200)

        expect(res.body.ok).toEqual(true)

        let count = await PhotoClassificationModel.countDocuments({ _id: model._id })
        expect(count).toEqual(0)
    })

    it("should activate photo classification model", async () => {
        let model = await PhotoClassificationModel.create({
            active: false
        })

        let res = await request(app)
            .post(`/model/${model._id}/activate`)
            .expect("Content-Type", /json/)
            .expect(200)
            
        expect(res.body.ok).toEqual(true)

        model = await PhotoClassificationModel.findOne({
            _id: model._id
        })

        expect(model.active).toBe(true)
    })

    it("should export photos as zipped archive", async () => {
        let res = await request(app)
            .get("/download")
            .expect("Content-Disposition", /attachment/)
            .expect(200)
        
        // TODO check zipped attachment
    })

})