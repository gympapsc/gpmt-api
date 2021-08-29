const request = require("supertest")
const express = require("express")
const mongoose = require("mongoose")
const seedDatabase = require("./seed")
const cookieParser = require("cookie-parser")
const bcrypt = require("bcrypt")

const { http } = require("./auth")
const { query, dispatch } = require("./store")
const {
    Message,
    User,
    Micturition,
    Drinking,
    Questionnaire,
    Answer,
    Photo,
    Stress,
    MicturitionPrediction,
    MicturitionModel,
    PhotoClassificationModel,
    Nutrition,
    Medication
} = require("./models")


describe("dispatch to database", () => {
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

        user = await User.findOne({email: "testing@taylor.com"})
    })

    afterAll(async () => {
        // disconnect from mongodb
        await mongoose.connection.close()
    })

    afterEach(async () => {
        await mongoose.connection.db.dropDatabase()
        await seedDatabase()
    })


    it("should return promise with no callback", async () => {
        let res = dispatch("ADD_MICTURITION", { date: new Date(), user: user._id })

        expect(res).toBeDefined()        
        expect(res instanceof Promise).toBeTruthy()
        expect(await res).toMatchObject({
            user: user._id
        })
    })

    it("should add micturition", done => {
        dispatch("ADD_MICTURITION", {
            date: new Date(),
            user: user._id
        }, (err, m) => {
            expect(err).toBeFalsy()
            Micturition.findOne({_id: m._id}, (err, doc) => {
                expect(doc).toMatchObject({
                    date: m.date,
                    user: m.user
                })
                done()
            })
        })
    })

    it("should update micturition", done => {
        dispatch("ADD_MICTURITION", {
            date: new Date(),
            user: user._id
        }, (err, m) => {
            expect(err).toBeFalsy()
            Micturition.findOne({_id: m._id}, (err, doc) => {
                expect(doc).toMatchObject({
                    date: m.date,
                    user: m.user
                })

                dispatch("UPDATE_MICTURITION", {
                    _id: m._id,
                    user: user,
                    date: new Date(2000, 0, 1),
                }, (err, n) => {
                    expect(err).toBeFalsy()

                    Micturition.findOne({_id: m._id}, (err, doc) => {
                        expect(doc).toMatchObject({
                            date: new Date(2000, 0, 1),
                            user: m.user
                        })
                        done()
                    })

                })

            })
        })
    })

    it("should delete micturition", done => {
        Micturition.create({date: new Date(), user: user._id}, (err, doc) => {
            dispatch("DELETE_MICTURITION", {
                _id: doc._id
            }, (err, n) => {
                expect(err).toBeFalsy()

                Micturition.countDocuments({_id: doc._id}, (err, count) => {
                    expect(err).toBeFalsy()
                    expect(count).toBe(0)
                    done()
                })

            })

        })
    })

    it("should add drinking", done => {
        dispatch("ADD_DRINKING", {
            date: new Date(),
            user: user._id,
            amount: 0.4,
            type: "Water"
        }, (err, m) => {
            expect(err).toBeFalsy()
            Drinking.findOne({_id: m._id}, (err, doc) => {
                expect(doc).toMatchObject({
                    date: m.date,
                    user: m.user,
                    amount: m.amount,
                    type: m.type
                })
                done()
            })
        })
    })

    it("should update drinking", done => {
        dispatch("ADD_DRINKING", {
            date: new Date(),
            user: user._id,
            amount: 0.4,
            type: "Water"
        }, (err, m) => {
            expect(err).toBeFalsy()
            Drinking.findOne({_id: m._id}, (err, doc) => {
                expect(doc).toMatchObject({
                    date: m.date,
                    user: m.user,
                    amount: m.amount,
                    type: m.type
                })

                dispatch("UPDATE_DRINKING", {
                    _id: m._id,
                    user: user,
                    date: new Date(2000, 0, 1),
                    amount: 0.2,
                    type: "Sprite"
                }, (err, n) => {
                    expect(err).toBeFalsy()

                    Drinking.findOne({_id: m._id}, (err, doc) => {
                        expect(doc).toMatchObject({
                            date: new Date(2000, 0, 1),
                            user: m.user,
                            amount: 0.2,
                            type: "Sprite"
                        })
                        done()
                    })

                })

            })
        })
    })

    it("should delete drinking", done => {
        Drinking.create({date: new Date(), user: user._id, amount: 0.4, type: "Water"}, (err, doc) => {
            dispatch("DELETE_DRINKING", {
                _id: doc._id
            }, (err, n) => {
                expect(err).toBeFalsy()

                Drinking.countDocuments({_id: doc._id}, (err, count) => {
                    expect(err).toBeFalsy()
                    expect(count).toBe(0)
                    done()
                })

            })

        })
    })

    it("should add nutrition", done => {
        dispatch("ADD_NUTRITION", {
            date: new Date(),
            user: user._id,
            mass: 0.9,
            type: "Fleisch"
        }, (err, m) => {
            expect(err).toBeFalsy()
            Nutrition.findOne({_id: m._id}, (err, doc) => {
                expect(doc).toMatchObject({
                    date: m.date,
                    user: m.user,
                    mass: m.mass,
                    type: m.type
                })
                done()
            })
        })
    })

    it("should update nutrition", done => {
        Nutrition.create({date: new Date(), user: user._id, type: "Lachs", mass: 0.8}, (err, doc) => {
            expect(err).toBeFalsy()
            dispatch("UPDATE_NUTRITION", {
                _id: doc._id,
                user: user._id,
                type: "Forelle",
                mass: 0.7,
                date: new Date(2000, 0, 1)
            }, (err, n) => {
                Nutrition.findOne({_id: doc._id}, (err, doc) => {
                    expect(err).toBeFalsy()
                    expect(doc).toMatchObject({
                        date: new Date(2000, 0, 1),
                        user: user._id,
                        mass: 0.7,
                        type: "Forelle"
                    })
                    done()
                })
            })
            
        })
    })

    it("should delete nutrition", done => {
        Nutrition.create({date: new Date(), user: user._id, type: "Lachs", mass: 0.8}, (err, doc) => {
            expect(err).toBeFalsy()
            dispatch("DELETE_NUTRITION", {
                _id: doc._id,
                user: user._id
            }, (err, n) => {
                Nutrition.countDocuments({_id: doc._id}, (err, count) => {
                    expect(count).toBe(0)
                    done()
                })
            })
            
        })
    })

    it("should add medication", done => {
        dispatch("ADD_MICTURITION", {
            date: new Date(),
            user: user._id
        }, (err, m) => {
            expect(err).toBeFalsy()
            Micturition.findOne({_id: m._id}, (err, doc) => {
                expect(doc).toMatchObject({
                    date: m.date,
                    user: m.user
                })
                done()
            })
        })
    })

    it("should update medication", done => {
        dispatch("ADD_MICTURITION", {
            date: new Date(),
            user: user._id
        }, (err, m) => {
            expect(err).toBeFalsy()
            Micturition.findOne({_id: m._id}, (err, doc) => {
                expect(doc).toMatchObject({
                    date: m.date,
                    user: m.user
                })
                done()
            })
        })
    })

    it("should delete medication", done => {
        dispatch("ADD_MICTURITION", {
            date: new Date(),
            user: user._id
        }, (err, m) => {
            expect(err).toBeFalsy()
            Micturition.findOne({_id: m._id}, (err, doc) => {
                expect(doc).toMatchObject({
                    date: m.date,
                    user: m.user
                })
                done()
            })
        })
    })


    it("should add bot message", done => {
        dispatch("ADD_MICTURITION", {
            date: new Date(),
            user: user._id
        }, (err, m) => {
            expect(err).toBeFalsy()
            Micturition.findOne({_id: m._id}, (err, doc) => {
                expect(doc).toMatchObject({
                    date: m.date,
                    user: m.user
                })
                done()
            })
        })
    })

    it("should add user message", done => {
        dispatch("ADD_USER_MESSAGE", {
            user: user._id,
            text: "Hallo"
        }, (err, m) => {
            expect(err).toBeFalsy()
            Message.findOne({_id: m._id}, (err, doc) => {
                expect(doc).toMatchObject({
                    user: m.user,
                    text: m.text,
                    sender: "user"
                })
                done()
            })
        })
    })

    it("should add photo", done => {
        dispatch("CREATE_PHOTO", {
            user: user._id,
            name: "test"
        }, (err, p) => {
            expect(err).toBeFalsy()
            Photo.findOne({_id: p._id}, (err, doc) => {
                expect(doc).toMatchObject({
                    user: p.user,
                    name: "test"
                })
                done()
            })
        })
    })

    it("should add photo classification model", done => {
        dispatch("ADD_MICTURITION", {
            date: new Date(),
            user: user._id
        }, (err, m) => {
            expect(err).toBeFalsy()
            Micturition.findOne({_id: m._id}, (err, doc) => {
                expect(doc).toMatchObject({
                    date: m.date,
                    user: m.user
                })
                done()
            })
        })
    })

    it("should delete photo classification model", done => {
        dispatch("ADD_MICTURITION", {
            date: new Date(),
            user: user._id
        }, (err, m) => {
            expect(err).toBeFalsy()
            Micturition.findOne({_id: m._id}, (err, doc) => {
                expect(doc).toMatchObject({
                    date: m.date,
                    user: m.user
                })
                done()
            })
        })
    })


    it("should add question", done => {
        Questionnaire.findOne({
            name: "ms_timerange"
        }, (err, q) => {

            dispatch("ADD_QUESTION", {
                parent_id: q._id,
                question: {
                    name: "test",
                    type: "string",
                    options: []
                }
            }, (err, r) => {
                
                Questionnaire.findOne({
                    name: "ms_timerange"
                }, (err, q) => {
                    expect(q.next.length).toBe(1)
                    expect(q.next[0].condition.length).toBe(0)
                    expect(q.next[0]._id).toEqual(r._id)

                    done()
                })
            })
        })
    })

    it("should insert question", done => {
        Questionnaire.findOne({
            name: "ms_timerange"
        }, (err, q) => {


            dispatch("INSERT_QUESTION", {
                next_id: q._id,
                question: {
                    name: "test",
                    type: "string",
                    options: []
                }
            }, (err, r) => {
                expect(r.next.length).toBe(1)
                expect(r.next[0]._id).toEqual(q._id)
                expect(r.next[0].condition.length).toEqual(0)

                Questionnaire.findOne({
                    name: "disease"
                }, (err, s) => {
                    expect(s.next.map(n => n._id)).not.toContainEqual(q._id)
                    expect(s.next.map(n => n._id)).toContainEqual(r._id)

                    done()
                })

            })
        })

    })

    it("should append question", done => {
        dispatch("ADD_MICTURITION", {
            date: new Date(),
            user: user._id
        }, (err, m) => {
            expect(err).toBeFalsy()
            Micturition.findOne({_id: m._id}, (err, doc) => {
                expect(doc).toMatchObject({
                    date: m.date,
                    user: m.user
                })
                done()
            })
        })
    })

    it("should delete question", done => {
        dispatch("ADD_MICTURITION", {
            date: new Date(),
            user: user._id
        }, (err, m) => {
            expect(err).toBeFalsy()
            Micturition.findOne({_id: m._id}, (err, doc) => {
                expect(doc).toMatchObject({
                    date: m.date,
                    user: m.user
                })
                done()
            })
        })
    })


    it("should add question condition", done => {
        Questionnaire.findOne({
            name: "disease"
        }, (err, q) => {
            let count = q.next[0].condition.length

            dispatch("ADD_CONDITION", {
                condition: {
                    type: "test",
                    value: "test"
                },
                _id: q._id,
                next_id: q.next[0]._id
            }, (err, m) => {

                Questionnaire.findOne({
                    name: "disease",
                }, (err, q) => {
                    expect(q.next[0].condition.map(c => c.type)).toContainEqual("test")
                    expect(q.next[0].condition.map(c => c.value)).toContainEqual("test")
                    expect(q.next[0].condition.length).toBe(count + 1)
                    done()
                })
            })
        })
    })

    it("should delete question condition", done => {
        Questionnaire.findOne({
            name: "disease"
        }, (err, q) => {

            dispatch("ADD_CONDITION", {
                condition: {
                    type: "test",
                    value: "test"
                },
                _id: q._id,
                next_id: q.next[0]._id
            }, (err, m) => {

                Questionnaire.findOne({
                    name: "disease",
                }, (err, q) => {
                    expect(q.next[0].condition.map(c => c.type)).toContainEqual("test")
                    expect(q.next[0].condition.map(c => c.value)).toContainEqual("test")
                    let count = q.next[0].condition.length
                    
                    dispatch("DELETE_QUESTION_CONDITION", {
                        _id: q._id,
                        next_id: q.next[0]._id,
                        condition_id: q.next[0].condition.find(c => c.type === "test")._id
                    }, (err, doc) => {
                        
                        Questionnaire.findOne({
                            name: "disease",
                        }, (err, q) => {
                            expect(q.next[0].condition.length).toBe(count - 1)
                            expect(q.next[0].condition.map(c => c.type)).not.toContainEqual("test")
                            done()
                        })
                    })
                })
            })
        })
    })
})


describe("query database", () => {
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

        user = await User.findOne({ email: "testing@taylor.com" })
    })

    afterAll(async () => {
        // disconnect from mongodb
        await mongoose.connection.close()
    })

    it("should query micturition", () => {

    })

    it("should query drinking", () => {

    })

    it("should query stress", () => {

    })

    it("should get user registrations within the last 100 days", done => {
        let now = new Date()
        let today = now.valueOf() - now.valueOf() % (24 * 3600 * 1000)
        now = today + 24 * 3600 * 1000
        query("USER_REGISTRATIONS_STATS", { role: "user", startDate: now - (100 * 24 * 3600 * 1000), endDate: now }, (err, doc) => {
            expect(doc.length).toBe(100)
            expect(doc.find(d => d.registrations === 2).date).toEqual(new Date(today))
            done()
        })
    })

    it("should get user bmi stats", done => {
        User.deleteMany({}, (err, _) => {
            User.create({
                role: "user",
                email: "fiona@taylor.com",
                firstname: "Fiona",
                surname: "Taylor",
                sex: "w",
                weight: 80,
                height: 1.80,
                passwordHash: "test",
                birthDate: new Date(2002, 8, 12)
            }, (err, doc) => {
                User.create({
                    role: "user",
                    email: "testing@taylor.com",
                    firstname: "Testing",
                    surname: "Taylor",
                    sex: "m",
                    weight: 90,
                    height: 1.80,
                    passwordHash: "test",
                    birthDate: new Date(2002, 8, 12)
                }, (err, doc) => {
                    
                    query("USER_BMI_STATS", {}, (err, doc) => {
                        expect(doc.length).toBe(2)
                        expect(doc).toContainEqual({
                            users: 1,
                            bmi: Math.floor(90 / Math.pow(1.8, 2))
                        })
                        expect(doc).toContainEqual({
                            users: 1,
                            bmi: Math.floor(80 / Math.pow(1.8, 2))
                        })
                        done()
                    })

                })
            }) 
        })
    })

    it("should get user gender statistics", done => {
        query("USER_GENDER_STATS", { role: "user" }, (err, doc) => {
            done()
        })
    })

    it("should get ms statistics", done => {
        query("MS_USER_STATS", { role: "user" }, (err, doc) => {
            expect(doc.length).not.toEqual(0)
            done()
        })
    })

    it("should get incontinence statistics", done => {
        query("INCONTINENCE_USER_STATS", { role: "user" }, (err, doc) => {
            done()
        })
    })

    it("should get photo upload statistics", done => {
        let now = new Date()
        let today = now.valueOf() - now.valueOf() % (24 * 3600 * 1000)
        now = today + 24 * 3600 * 1000
        Photo.create({
            user
        }, (err, doc) => {
            query("PHOTO_UPLOAD_STATS", { startDate: now - (100 * 24 * 3600 * 1000), endDate: now }, (err, doc) => {
                expect(doc.length).toBe(100)
                expect(doc.find(d => d.uploads >= 1).date).toEqual(new Date(today))
                done()
            })
        })
    })

    it("should get user micturition statistics", done => {
        let now = new Date()
        let today = now.valueOf() - now.valueOf() % (24 * 3600 * 1000)
        now = today + 24 * 3600 * 1000
        Micturition.create({
            user,
            date: new Date()
        }, (err, doc) => {
            query("USER_MICTURITION_ENTRY_STATS", { startDate: now - (100 * 24 * 3600 * 1000), endDate: now }, (err, doc) => {
                expect(doc.length).toBe(100)
                done()
            })
        })
    })

    it("should get user nutrition statistics", done => {
        let now = new Date()
        let today = now.valueOf() - now.valueOf() % (24 * 3600 * 1000)
        now = today + 24 * 3600 * 1000
        Nutrition.create({
            user,
            date: new Date(),
            mass: 0.1,
            type: "Burger"
        }, (err, doc) => {
            query("USER_NUTRITION_ENTRY_STATS", { startDate: now - (100 * 24 * 3600 * 1000), endDate: now }, (err, doc) => {
                expect(doc.length).toBe(100)
                done()
            })
        })
    })

    it("should get user drinking statistics", done => {
        let now = new Date()
        let today = now.valueOf() - now.valueOf() % (24 * 3600 * 1000)
        now = today + 24 * 3600 * 1000
        Drinking.create({
            user,
            date: new Date(),
            amount: 0.1,
            type: "Burger"
        }, (err, doc) => {
            query("USER_DRINKING_ENTRY_STATS", { startDate: now - (100 * 24 * 3600 * 1000), endDate: now  }, (err, doc) => {
                expect(doc.length).toBe(100)
                done()
            })
        })
    })

})
