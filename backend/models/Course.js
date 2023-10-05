const mongoose = require('mongoose')

const courseSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        trim : true
    },
    courseDescription : {
        type : String,
        required : true,
        trim : true
    },
    language : {
        type : String,
        enum : ['English', 'Hindi']
    },
    price : {
        type : Number
    },
    instructor : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    courseContent : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Section',
            required : true
        }
    ],
    whatYouWillLearn : {
        type : String,
    },
    author : {
        type : String
    },
    dateCreated : {
        type : Date,
        default : Date.now()
    },
    tags: {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Tag',
    },
    thumbnail  : {
        type : String
    },
    ratingAndReviews : [
        {
            tpe : mongoose.Schema.Types.ObjectId,
            ref : 'RatingAndReview'
        }
    ],
    studentsEnrolled: [
        {
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User",
        }
    ]
})

module.exports = mongoose.model('Course', courseSchema)