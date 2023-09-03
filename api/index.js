const express = require('express')
const app = express()
require('dotenv').config()
const jwtSecret = process.env.JWT_SECRET
const jwt = require('jsonwebtoken')
const User= require('./models/User')
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')


mongoose.connect(process.env.MONGODB_URL)


app.get('/test', (req, res) =>{
    console.log('testing testing one two')
    res.json('ok, this works')
})

app.use(express.json())

app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
}))

app.use(cookieParser())

app.get('/profile', (req,res)=>{
    const token = req.cookies?.token
    if(token){
        jwt.verify(token, jwtSecret, {}, (err, userData)=>{
            if(err) throw err
            
            res.json(userData)
            console.log("jwt token verified")
        })
    }
    else {
        res.status(403).json('no token')
    }

})
app.post('/register',async (req, res) => {
    console.log('register')
    const {username, password} = req.body
    try {
        const createdUser = await User.create({username, password})
        jwt.sign({
            userId: createdUser._id}, 
            jwtSecret, 
           {},
            (err, token)=>{
                if(err) throw err
                console.log("THIS IS THE TOKEN",token, "that was the token")
            res.cookie('token', token, {sameSite: 'none', secure: true})
            .status(201)
            .json({id: createdUser._id, username})
            console.log(token, username)
        })
    }
    catch(err){
        if(err) {
            throw err
            res.status(500).json('THIS IS NOT WORKING, WHAT IS GOING ON')
        }
    }
    
})

app.listen(4040)