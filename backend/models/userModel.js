const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName : {
        type : String,
        required : true,
        trim : true
    },
    lastName : {
        type : String,
        required : true,
        trim : true
    },
    email : {
        type : String,
        required : true,
        trime : true
    },
    password : {
        type : String,
        required : true
    },
    accountType : {
        type : String,
        enum : ['Student', 'Admin', 'Instructor'],
        required : true
    },
    additionalDetails : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Profile',
        required : true
    },
    active : {
        type : Boolean,
        default : true
    },
    approved : {
        type : Boolean,
        default : true
    },
    phone : {
        type : Number,
        trim : true
    },
    token : {
        type : String
    },
    expiresIn : {
        type : Date
    },
    courses : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Course'
        }
    ],
    image : {
        type : String,
        required : true
    },
    courseProgress : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'CourseProgress'
        }
    ]
}, {timestamps : true}

)

module.exports = mongoose.model('User', userSchema)