const request = require("supertest")
const express = require("express")
const mongoose = require("mongoose")
const seedDatabase = require("../seed")

const micturitionRouter = require("./micturition")
const {
    Micturition,
    User
} = require("../models")


describe("/micturition", () => {

    const app = express()
    let user

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

        user = await User.findOne({})

        app.use(express.json())
        app.use(async (req, res, next) => {
            req.user = user
            next()
        })
        app.use(micturitionRouter)
    })

    afterAll(async () => {
        // disconnect from mongodb
        await mongoose.connection.close()
    })

    afterEach(async () => {
        await Micturition.deleteMany({})
    })

    it("should get all entries", async () => {
        let entry = {
            date: new Date(),
            user: user._id
        }

        // create
        entry = await Micturition.create(entry)
        entry = JSON.parse(JSON.stringify(entry))

        let res = await request(app)
            .get("/")
            .expect("Content-Type", /json/)
            .expect(200)

        expect(res.body.entries).toContainEqual(entry)
    })

    it("should get entries in time range", async () => {
        let entry = {
            date: new Date(),
            user: user._id
        }

        // create
        entry = await Micturition.create(entry)
        entry = JSON.parse(JSON.stringify(entry))

        let now = new Date().valueOf()
        let secondAgo = now - 1000

        let res = await request(app)
            .get(`/${secondAgo}/${now}`)
            .expect("Content-Type", /json/)
            .expect(200)

        expect(res.body.entries).toContainEqual(entry)
    })

    it("should get entry by id", async () => {
        let entry = {
            date: new Date(),
            user: user._id
        }

        // create
        entry = await Micturition.create(entry)
        entry = JSON.parse(JSON.stringify(entry))

        let res = await request(app)
            .get(`/${entry._id}`)
            .expect("Content-Type", /json/)
            .expect(200)

        expect(res.body.entries).toContainEqual(entry)
    })

    it("should delete entry", async () => {
        let entry = {
            date: new Date(),
            user: user._id
        }

        // create
        entry = await Micturition.create(entry)
        entry = JSON.parse(JSON.stringify(entry))


        let res = await request(app)
            .delete(`/${entry._id}`)
            .expect("Content-Type", /json/)
            .expect(200)
        
        expect(res.body.ok).toBeTruthy()

        let count = await Micturition.countDocuments({_id: entry._id})
        expect(count).toBe(0)
    })

    it("should update entry", async () => {
        let entry = {
            date: new Date(),
            user: user._id
        }

        // create
        entry = await Micturition.create(entry)
        entry = JSON.parse(JSON.stringify(entry))


        let res = await request(app)
            .put(`/${entry._id}`)
            .send({
                ...entry,
                date: new Date(2000, 0, 1)
            })
            .expect("Content-Type", /json/)
            .expect(200)
        
        expect(res.body.ok).toBeTruthy()

        entry = await Micturition.findOne({_id: entry._id})

        expect(entry.date).toEqual(new Date(2000, 0, 1))
    })
})