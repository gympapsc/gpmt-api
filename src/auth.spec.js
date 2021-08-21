const request = require("supertest")
const express = require("express")
const mongoose = require("mongoose")
const seedDatabase = require("./seed")
const cookieParser = require("cookie-parser")

const { http } = require("./auth")
const signinRouter = require("./routes/signin")
const {
    Message,
    User
} = require("./models")


describe("authentication", () => {
    let app
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
    })

    beforeEach(() => {
        app = express()
        app.use(express.json())
        app.use(cookieParser())
        app.use(signinRouter)
    })

    afterAll(async () => {
        // disconnect from mongodb
        await mongoose.connection.close()
    })


    it("should unauthorize unauthenticated requests", async () => {
        app.get("/secure", http("user"), (req, res) => {
            res.json({
                ok: true
            })
        })      
                
        let res = await request(app)
            .get("/secure")
            .expect(403)
        
        expect(res.body.ok).toBe(false)
    })

    it("should authorize signed in user", async () => {
        user = await User.findOne({email: "testing@taylor.com"})

        app.get("/secure", http("user"), (req, res) => {
            expect(req.user).toBeDefined()
            
            expect(
                JSON.parse(JSON.stringify(req.user))
            ).toEqual(
                JSON.parse(JSON.stringify(user))
            )

            res.json({
                ok: true
            })
        })

        // sign in
        let res = await request(app)
            .post("/signin")
            .send({
                email: "testing@taylor.com",
                password: "Password"
            })
            .expect(200)        
                
        res = await request(app)
            .get("/secure")
            .set("Cookie", res.headers["set-cookie"])
            .expect(200)
        
        expect(res.body.ok).toBe(true)
    })

    it("should unauthorize user access", async () => {
        user = await User.findOne({email: "testing@taylor.com"})

        app.get("/secure", http("admin"), (req, res) => {
            res.json({
                ok: true
            })
        })

        // sign in
        let res = await request(app)
            .post("/signin")
            .send({
                email: "testing@taylor.com",
                password: "Password"
            })
            .expect(200)        
                
        res = await request(app)
            .get("/secure")
            .set("Cookie", res.headers["set-cookie"])
            .expect(401)
    })

    it("should authorize signed in admin", async () => {
        admin = await User.findOne({email: "hakim@admin.com"})

        app.get("/secure", http("admin"), (req, res) => {
            expect(req.user).toBeDefined()
            
            expect(
                JSON.parse(JSON.stringify(req.user))
            ).toEqual(
                JSON.parse(JSON.stringify(admin))
            )

            res.json({
                ok: true
            })
        })

        // sign in
        let res = await request(app)
            .post("/signin/admin")
            .send({
                email: "hakim@admin.com",
                password: "Password"
            })
            .expect(200)
                
        res = await request(app)
            .get("/secure")
            .set("Cookie", res.headers["set-cookie"])
            .expect(200)
        
        expect(res.body.ok).toBe(true)
    })
})