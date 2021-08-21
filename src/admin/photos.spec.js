const request = require("supertest")
const express = require("express")
const mongoose = require("mongoose")
const seedDatabase = require("../seed")

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

})