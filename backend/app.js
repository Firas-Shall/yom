const cors = require('cors')
const express = require('express')
const HttpError = require('./models/http-error')
const mongoose = require('mongoose')
require('dotenv').config()
const usersRoute = require('./routes/users-route')
const journalsRoute = require('./routes/journals-route')
const friendsRoute = require('./routes/friends-route')

const PORT = process.env.PORT || 5000

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(',')
        : ['http://localhost:5173']
}))
app.use(express.json())

app.use('/api/users', usersRoute)
app.use('/api/journals', journalsRoute)
app.use('/api/friends', friendsRoute)

app.use((req,res,next)=>{
    throw new HttpError('Could not find this route!', 404)
})

app.use((error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }
    const statusCode = (typeof error.code === 'number' && error.code >= 100 && error.code <= 599)
        ? error.code
        : 500;
    res.status(statusCode).json({
        message: error.message || 'An unknown error occurred'
    });
});

mongoose.connect(process.env.MONGO_URL).then(() => {
    app.listen(PORT, () => {
        console.log(`YOM server running on port ${PORT}`)
    })
}).catch(err => {
    console.log(err)
})

