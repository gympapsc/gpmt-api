const mongoose = require("mongoose")
const { Schema } = mongoose


const conversationSchema = new Schema({ 
    messages: [{type: Schema.Types.ObjectId, ref: 'Message'}]
})

module.eports = mongoose.model("Conversation", conversationSchema)
