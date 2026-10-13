const express = require('express')
const router = express.Router()
const journalsController = require('../controllers/journals-controller')
const checkAuth = require('../middleware/check-auth')

router.use(checkAuth)
router.get('/today', journalsController.hasPostedToday)
router.get('/feed', journalsController.getFeed)
router.get('/user/:uid', journalsController.getJournalsByUserId)
router.get('/:jid', journalsController.getJournalById)
router.post('/', journalsController.createJournal)


module.exports = router;