const mongoose = require('mongoose')

const profileSchema = new mongoose.Schema({
    gender : {
        type : String,
        required : true,
    },
    dateOfBirth : {
        type : String,
    },
    profession : {
        type : String,
        enum : ['Student', 'Developer']
    },
    about : {
        type : String,
        trim : true
    },
    college : {
        type : String,
        trim : true
    }
})

module.exports = mongoose.model('Profile', profileSchema)