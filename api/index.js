const express = require('express')
const app = express()
require('dotenv').config()
const jwtSecret = process.env.JWT_SECRET
const jwt = require('jsonwebtoken')
const User= require('./models/User')
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const bcrypt = require('bcryptjs')
const ws = require('ws')


mongoose.connect(process.env.MONGODB_URL)


const saltRounds = bcrypt.genSaltSync(10)

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

//LOGIN

app.post('/login', async (req, res) => {
    const {username, password} = req.body
    const existingUser = await User.findOne({username})
    if(!existingUser){
        return res.status(500)
    }
    const verifiedUser = bcrypt.compareSync(password, existingUser.password)
    if(verifiedUser) {
        jwt.sign({
            userId: existingUser._id, username}, 
            jwtSecret, 
           {},
            (err, token)=>{
                if(err) throw err
                console.log("THIS IS THE TOKEN",token, "that was the token")
            res.cookie('token', token, {sameSite: 'none', secure: true})
            .status(201)
            .json({id: existingUser._id, username})
            console.log(token, username)
        })
    }

})

//REGISTER

app.post('/register',async (req, res) => {
    console.log('register')
    const {username, password} = req.body
    try {
        const hashedPassword = bcrypt.hashSync(password, saltRounds)
        const createdUser = await User.create(
            {
                username: username, 
                password: hashedPassword
            })
        jwt.sign({
            userId: createdUser._id, username}, 
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

//WEBSOCKET SERVER

const server = app.listen(4040)

const wss = new ws.WebSocketServer({server})
wss.on('connection', (connection, req) =>{
    console.log('websocket connected')
    const cookies = req.headers.cookie
    if(cookies) {
        const tokenCookiesString = cookies.split(";").find(str => str.startsWith('token='))
        if (tokenCookiesString) {
            const token = tokenCookiesString.split('=')[1]
            jwt.verify(token, jwtSecret, {}, (err, userData)=>{
                if(err) throw err
                const {userId, username} = userData
                connection.userId = userId
                connection.username = username 
            })
        }
    }

    [...wss.clients].forEach(client => {
      client.send(JSON.stringify({
        online: [...wss.clients].map(c => ({userId:c.userId,username:c.username})),
      }));
    });
  }
)