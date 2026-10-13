const friendsController = require('../controllers/friends-controller')
const express = require('express')
const router = express.Router()
const checkAuth = require('../middleware/check-auth')

router.use(checkAuth)
router.get('/', friendsController.getMyFriends)
router.get('/pending', friendsController.getMyPending)
router.post('/:uid', friendsController.addFriend)
router.patch('/:uid/accept', friendsController.acceptFriend);
router.delete('/:uid', friendsController.removeFriend)

module.exports = router