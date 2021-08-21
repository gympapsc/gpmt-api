const request = require("supertest")
const express = require("express")
const mongoose = require("mongoose")
const seedDatabase = require("./seed")
const cookieParser = require("cookie-parser")

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
        await Micturition.deleteMany({})
        await Drinking.deleteMany({})
        await Stress.deleteMany({})
        await Nutrition.deleteMany({})
        await Medication.deleteMany({})

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
                id: doc._id,
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
                id: doc._id,
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

    it("should add photo", done => {
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

    it("should delete question condition", done => {
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

        user = await User.findOne({email: "testing@taylor.com"})
    })

    afterAll(async () => {
        // disconnect from mongodb
        await mongoose.connection.close()
    })

    it("should get user registrations", () => {

    })

    it("should get user gender statistics", () => {

    })
})