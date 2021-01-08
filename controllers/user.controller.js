
const User = require("../models/user.model")


exports.allAccess = (req, res)=>{
    res.status(200).send("public content")
}

exports.userBoard = (req, res) => {
    res.status(200).send("User content")
}

exports.adminBoard = (req, res) => {
    res.status(200).send("Admin content")
}


exports.follow = (req, res) => {
     User.findOne({"_id": req.body.currentUser}, async function (err, user) {
        if (!user.followed.includes(req.body.otherUserId)){
            await user.followed.push(req.body.otherUserId)
            await user.save()
            console.log(user)
        }
    })
     User.findOne({"_id": req.body.otherUserId}, async function (err, user) {
        if (!user.followers.includes(req.body.currentUser)){
            await user.followers.push(req.body.currentUser)
            await user.save()
            console.log(user)
            res.send(user)
        }
    })
    
}

exports.unfollow = (req, res) => {
    User.findOne({"_id": req.body.currentUser}, async function (err, user) {
        await user.followed.pull(req.body.otherUserId)
        user.save((err) => {
            if (err) res.send(err)
        })
        console.log(user)
    })
    User.findOne({"_id": req.body.otherUserId}, async function (err, user) {
        await user.followers.pull(req.body.currentUser)
        user.save((err) => {
            if (err) res.send(err)
        })
        console.log(user)
    })
    res.send("Unfollow successful")
}

//display user profile
exports.userProfile = (req, res) => {
    User.findById(req.params.id).
    populate('followed').
    populate('followers').
    populate({
        path: 'posts',
        populate: {
            path: 'creator',
            model: 'User'
        }
    }).
    populate('profilePic').
    exec((err, user) => {
        if(err){
            res.status(400).send({message: "Profile not found"})
        } else {
            console.log(user.followed)
            res.send(user)
        }
    })
}

//return all users
exports.all = (req, res) => {
    User.find().exec((err, users) => {
        if (err) {
            res.status(400).send({message: "Users not found"})
        } else {
            res.send(users)
        }
    })
}

