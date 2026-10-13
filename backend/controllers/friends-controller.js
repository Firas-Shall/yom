const HttpError = require('../models/http-error')
const Friendship = require('../models/friendship')
const User = require('../models/user')


const getMyFriends = async (req, res) => {
    const { userId } = req.user

    let hasFriends
    try {
        hasFriends = await Friendship.find({
            $or: [
                { user1: userId, status: 'accepted' },
                { user2: userId, status: 'accepted' }
            ]
        })
            .populate('user1', 'username')
            .populate('user2', 'username')
            .lean()
    } catch (err) {
        throw new HttpError("Could not get friends", 500)
    }

    if (!hasFriends || hasFriends.length === 0) {
        return res.json({ friends: [] });
    }

    const friends = hasFriends.map(friendship => {
        if (friendship.user1._id.toString() === userId) {
            return friendship.user2
        }
        return friendship.user1
    })

    res.json({ friends })


}


const getMyPending = async (req, res) => {
    const { userId } = req.user

    let hasFriends
    try {
        hasFriends = await Friendship.find({
            $or: [
                { user1: userId, status: 'pending' },
                { user2: userId, status: 'pending' }
            ]
        })
            .populate('user1', 'username')
            .populate('user2', 'username')
            .lean()
    } catch (err) {
        throw new HttpError("Could not get friends", 500)
    }

    if (!hasFriends || hasFriends.length === 0) {
        return res.json({ sentRequests: [], receivedRequests: [] });
    }

    const sentRequests = [];
    const receivedRequests = [];

    hasFriends.forEach(friendship => {
        if (friendship.user1._id.toString() === userId) {
            sentRequests.push(friendship.user2);
        } else {
            receivedRequests.push(friendship.user1);
        }
    });

    res.json({ sentRequests, receivedRequests });
}

const addFriend = async (req, res) => {
    const user1 = req.user.userId
    const user2 = req.params.uid

    if (user1 === user2) {
        throw new HttpError("Cannot send friend request to yourself", 400);
    }


    let userCount, friendship
    try {
        [userCount, friendship] = await Promise.all([
            User.countDocuments({ _id: { $in: [user1, user2] } }),
            Friendship.exists({
                $or: [
                    { user1: user1, user2: user2 },
                    { user1: user2, user2: user1 }
                ]
            })
        ])
    } catch (err) {
        throw new HttpError("Something went wrong", 500)
    }

    if (userCount !== 2) {
        throw new HttpError("One or both users do not exist", 404)
    }

    if (friendship) {
        throw new HttpError("Friendship already exists", 409)
    }

    const newFriendship = new Friendship({
        user1,
        user2,
    })

    try {
        await newFriendship.save()
    } catch (err) {
        throw new HttpError("Something went wrong", 500)
    }

    res.json({ newFriendship })
}

const acceptFriend = async (req, res) => {
    const user1 = req.user.userId
    const user2 = req.params.uid

    let friendship
    try {
        friendship = await Friendship.findOne({
            $or: [
                { user1: user1, user2: user2 },
                { user1: user2, user2: user1 }
            ]
        })
    } catch (err) {
        throw new HttpError("Something went wrong", 500)
    }

    if (!friendship) {
        throw new HttpError("Friendship doesn't exist", 404)
    }

    if (friendship.status !== 'pending') {
        throw new HttpError("Friendship is not pending", 409)
    }

    if (friendship.user2.toString() !== user1) {
        throw new HttpError("Not authorized to accept this request", 403);
    }

    friendship.status = 'accepted'
    try {
        await friendship.save()
    } catch (err) {
        throw new HttpError("Something went wrong", 500)
    }

    res.json({ friendship })
}

const removeFriend = async (req, res) => {
    const user1 = req.user.userId
    const user2 = req.params.uid

    let friendship
    try {
        friendship = await Friendship.findOneAndDelete({
            $or: [
                { user1: user1, user2: user2 },
                { user1: user2, user2: user1 }
            ]
        })
    } catch (err) {
        throw new HttpError("Something went wrong", 500)
    }

    if (!friendship) {
        throw new HttpError("Friendship doesn't exist", 404)
    }

    res.json({ message: "Friendship removed" })
}

module.exports = { getMyFriends, getMyPending, addFriend, removeFriend, acceptFriend }