const Journal = require('../models/journal')
const journalSchema = require('../schemas/journal-schema')
const HttpError = require('../models/http-error')
const User = require('../models/user')
const Friendship = require('../models/friendship')

const getTodayRange = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return { today, tomorrow }
}

const areFriends = async (a, b) => {
    try {
        return await Friendship.exists({
            status: 'accepted',
            $or: [
                { user1: a, user2: b },
                { user1: b, user2: a }
            ]
        })
    } catch (err) {
        throw new HttpError("Something went wrong", 500)
    }
}


const getJournalById = async (req, res) => {

    const journalId = req.params.jid

    let journal
    try {
        journal = await Journal.findById(journalId).lean()
    } catch (err) {
        throw new HttpError('Something went wrong!', 500)
    }

    if (!journal) {
        throw new HttpError('Journal not found!', 404)
    }

    const creator = journal.userId.toString()
    const user = req.user.userId

    if (creator !== user && !(await areFriends(creator, user))) {
        throw new HttpError("Can't access journals of non friends", 403)
    }

    res.json({ journal: journal })
}

const getJournalsByUserId = async (req, res) => {
    const user1 = req.params.uid
    const user2 = req.user.userId

    if (user1 !== user2 && !(await areFriends(user1, user2))) {
        throw new HttpError("Can't access journals of non friends", 403)
    }

    let journals
    try {
        journals = await Journal.find({ userId: user1 }).sort({ date: -1 }).lean()
    } catch (err) {
        throw new HttpError('Something went wrong!', 500)
    }

    res.json({ journals: journals || [] })
}

const createJournal = async (req, res) => {
    const result = journalSchema.safeParse(req.body)
    if (!result.success) {
        throw new HttpError(result.error.issues[0]?.message || "Invalid journal", 422)
    }

    const { content } = result.data
    const { userId } = req.user
    const { today, tomorrow } = getTodayRange()

    let userExists, existingJournal
    try {
        [userExists, existingJournal] = await Promise.all([
            User.exists({ _id: userId }),
            Journal.exists({ userId, date: { $gte: today, $lt: tomorrow } })
        ])
    } catch (err) {
        throw new HttpError("Creating journal failed", 500)
    }

    if (!userExists) {
        throw new HttpError("Could not find user!", 404)
    }

    if (existingJournal) {
        throw new HttpError(
            "You already created a journal today",
            409
        );
    }

    const newJournal = new Journal({
        content,
        userId,
        date: new Date()
    })

    try {
        await newJournal.save()
    } catch (err) {
        throw new HttpError("Couldn't create new journal", 500)
    }

    res.status(201).json({ newJournal })
}

const hasPostedToday = async (req, res) => {
    const { userId } = req.user
    const { today, tomorrow } = getTodayRange()

    let existingJournal;
    try {
        existingJournal = await Journal.exists({
            userId,
            date: { $gte: today, $lt: tomorrow }
        });
    } catch (err) {
        throw new HttpError("Could not check journal", 500);
    }

    res.json({ hasPosted: !!existingJournal });
}

const getFeed = async (req, res) => {
    const { userId } = req.user

    let friendships
    try {
        friendships = await Friendship.find({
            status: 'accepted',
            $or: [{ user1: userId }, { user2: userId }]
        }, 'user1 user2').lean()
    } catch (err) {
        throw new HttpError("Fetching feed failed, please try again.", 500)
    }

    const friendIds = friendships.map(f =>
        f.user1.toString() === userId ? f.user2 : f.user1
    )

    if (friendIds.length === 0) {
        return res.json({ journals: [] });
    }

    const { today, tomorrow } = getTodayRange()

    let journals
    try {
        journals = await Journal.find({
            userId: { $in: friendIds },
            date: {
                $gte: today,
                $lt: tomorrow
            }
        })
            .sort({ date: -1 })
            .populate('userId', 'username')
            .lean()
    } catch (err) {
        throw new HttpError("Fetching feed failed, please try again.", 500)
    }

    res.json({ journals })
}

module.exports = { getJournalById, getJournalsByUserId, createJournal, hasPostedToday, getFeed }