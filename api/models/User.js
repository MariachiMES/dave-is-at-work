const Mongoose = require('mongoose')

const userSchema = new Mongoose.Schema({
    username: {
        type: String,
        unique: true,
        timestamps: true,
        
    },
    password: {
        type:String,
    },
})

const User = Mongoose.model('User', userSchema)

module.exports = User

