const request = require("supertest")
const express = require("express")
const mongoose = require("mongoose")
const seedDatabase = require("../seed")

const questionnaireRouter = require("./questionnaire")
const {
    Questionnaire,
    User
} = require("../models")


describe("/admin/questionnaire", () => {
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
        app.use(questionnaireRouter)
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

    it("should get questionnaire", async () => {
        let questions = await Questionnaire.find({})

        let res = await request(app)
            .get("/")
            .expect("Content-Type", /json/)
            .expect(200)
        
        expect(JSON.stringify(res.body)).toEqual(JSON.stringify({questionnaire: questions}))
    })

    it("should append question", async () => {
        let root = await Questionnaire.findOne({root: true })

        let res = await request(app)
            .post(`/${root._id}`)
            .send({
                question: {
                    name: "test",
                    root: false,
                    condition: [],
                    options: [],
                    next: [],
                    type: "string"
                }
            })
            .expect("Content-Type", /json/)
            .expect(200)
        
        let question = await Questionnaire.findOne({ _id: res.body.question._id })
        root = await Questionnaire.findOne({root: true })


        expect(question).toBeDefined()

        expect(res.body.ok).toBeTruthy()
        expect(root.next.map(n => n._id)).toContainEqual(question._id)

        await Questionnaire.deleteOne({ _id: question._id })
    })

    it("should insert question before root", async () => {
        let root = await Questionnaire.findOne({root: true })

        let res = await request(app)
            .post(`/${root._id}`)
            .query({ insert: true })
            .send({
                question: {
                    name: "test",
                    root: false,
                    condition: [],
                    options: [],
                    next: [],
                    type: "string"
                }
            })
            .expect("Content-Type", /json/)
            .expect(200)
    
        expect(res.body.ok).toBeTruthy()        

        let question = await Questionnaire.findOne({ _id: res.body.question._id })
        expect(question).toBeDefined()
        expect(question.root).toBe(true)
        expect(question.next.map(n => n._id)).toContainEqual(root._id)

        root = await Questionnaire.findOne({_id: root._id })
        expect(root.root).toBe(false)
    })

    it("should insert question", async () => {
        let q = await Questionnaire.findOne({name: "ms_timerange" })
        expect(q.root).toBe(false)

        let res = await request(app)
            .post(`/${q._id}`)
            .query({ insert: true })
            .send({
                question: {
                    name: "test",
                    root: false,
                    options: [],
                    next: [],
                    type: "string"
                }
            })
            .expect("Content-Type", /json/)
            .expect(200)
    
        expect(res.body.ok).toBeTruthy()        

        let question = await Questionnaire.findOne({ _id: res.body.question._id })
        expect(question).toBeDefined()
        expect(question.root).toBe(false)
        expect(question.next.map(n => n._id)).toContainEqual(q._id)

        q = await Questionnaire.findOne({_id: q._id })
        expect(q.root).toBe(false)
    })

    it("should append existing question", async () => {
        // append incontinence question to ms_timerange

        let msTimerange = await Questionnaire.findOne({name: "ms_timerange" })
        let incontinence = await Questionnaire.findOne({ name: "incontinence" })

        let res = await request(app)
            .post(`/${msTimerange._id}`)
            .send({
                question: {
                    _id: incontinence._id
                }
            })
            .expect("Content-Type", /json/)
            .expect(200)
    
        expect(res.body.ok).toBeTruthy()        

        msTimerange = await Questionnaire.findOne({ _id: msTimerange._id })
        expect(msTimerange.next.map(n => n._id)).toContainEqual(incontinence._id)
    })

    it("should delete question", async () => {
        let incontinence = await Questionnaire.findOne({ name: "incontinence" })
        expect(incontinence).toBeDefined()
        let next = incontinence.next[0]._id

        let digestionDisorder = await Questionnaire.findOne({ _id: next })
        expect(digestionDisorder.root).toBe(false)

        let res = await request(app)
            .delete(`/${incontinence._id}/${digestionDisorder._id}`)
            .expect("Content-Type", /json/)
            .expect(200)
    
        expect(res.body.ok).toBeTruthy()
        
        incontinence = await Questionnaire.findOne({ _id: incontinence._id })
        expect(incontinence.next.map(n => n._id)).not.toContainEqual(digestionDisorder._id)

        digestionDisorder = await Questionnaire.findOne({ _id: digestionDisorder._id })
        expect(digestionDisorder).toBeDefined()
    })

    it("should add question condition", async () => {
        let root = await Questionnaire.findOne({root: true })

        let res = await request(app)
            .post(`/${root._id}/${root.next[0]._id}/condition`)
            .send({
                condition: {
                    value: "test",
                    type: "eq"
                }
            })
            .expect("Content-Type", /json/)
            .expect(200)
        
        expect(res.body.ok).toBeTruthy()
        
        root = await Questionnaire.findOne({ root: true })
        expect(root).toBeDefined()
        let condition = root.next[0].condition
        expect(condition.find(c => c.type === "eq" && c.value === "test")).toBeDefined()
    })

    it("should delete question condition", async () => {
        let root = await Questionnaire.findOne({root: true })
        let condition = root.next[0].condition
        expect(root.next[0].condition).toContainEqual(condition[0])


        let res = await request(app)
            .delete(`/${root._id}/${root.next[0]._id}/condition/${condition[0]._id}`)
            .expect("Content-Type", /json/)
            .expect(200)
        
        expect(res.body.ok).toBeTruthy()
        
        root = await Questionnaire.findOne({ root: true })
        expect(root.next[0].condition).not.toContainEqual(condition[0])
    })

    it("should add question option", async () => {
        let root = await Questionnaire.findOne({root: true })

        await Questionnaire.updateOne({
            _id: root._id
        }, {
            $set: { type: "radio" }
        })

        let option = {
            title: "test",
            value: "test"
        }

        let res = await request(app)
            .post(`/${root._id}/option`)
            .send({
                option
            })
            .expect("Content-Type", /json/)
            .expect(200)
        
        expect(res.body.ok).toBeTruthy()
        
        root = await Questionnaire.findOne({ _id: root._id })
        expect(root.options[0]).toMatchObject(option)
    })

    it("should delete question option", async () => {
        let root = await Questionnaire.findOne({root: true })

        let option = {
            title: "test",
            value: "test"
        }

        await Questionnaire.updateOne({
            _id: root._id
        }, {
            $set: { type: "radio" },
            $push: { options: [ option ] }
        })
        root = await Questionnaire.findOne({ _id: root._id })
        let option_id = root.options[0]._id

        let res = await request(app)
            .delete(`/${root._id}/option/${option_id}`)
            .expect("Content-Type", /json/)
            .expect(200)
        
        expect(res.body.ok).toBeTruthy()
        
        root = await Questionnaire.findOne({ _id: root._id })
        expect(root.options.length).toEqual(0)
    })
})