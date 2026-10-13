const usersController = require('../controllers/users-controller')
const express = require('express')
const router = express.Router()

router.get('/', usersController.getUsers)

router.get('/search', usersController.search)

router.post('/login', usersController.login)

router.post('/signup', usersController.signup)

module.exports = router
