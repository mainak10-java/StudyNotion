const mongoose = require("mongoose");

const tagsSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true,
    },
    description: {
        type:String,
    },
    courses: [
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Course",
        },
    ]
});

module.exports = mongoose.model("Tag", tagsSchema);