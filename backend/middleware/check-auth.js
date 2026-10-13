const jwt = require('jsonwebtoken')
const HttpError = require('../models/http-error')

module.exports = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next()
    }
    try{
        const token = req.headers.authorization?.split(' ')[1]
        if(!token){
            throw new HttpError('Authentication Failed', 401)
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
        req.user = {
            userId: decodedToken.userId
        }
        next()
    }catch(err){
        throw new HttpError('Authentication Failed!', 401)
    }
}