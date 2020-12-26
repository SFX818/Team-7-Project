
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
            console.log(user)
        }
    })
     User.findOne({"_id": req.body.otherUserId}, async function (err, user) {
        if (!user.followers.includes(req.body.currentUser)){
            await user.followers.push(req.body.currentUser)
            console.log(user)
        }
    })
    res.send("Follow successful")
}

exports.unfollow = (req, res) => {
    User.findOne({"_id": req.body.currentUser}, async function (err, user) {
        await user.followed.pull(req.body.otherUserId)
        console.log(user)
    })
    User.findOne({"_id": req.body.otherUserId}, async function (err, user) {
        await user.followers.pull(req.body.currentUser)
        console.log(user)
    })
    res.send("Unfollow successful")
}

//display user profile
exports.userProfile = (req, res) => {
    const id= req.body._id
    User.find({_id: id}).then((user)=>{
        if(!user)
        return res.status(400).send({message: "Profile not found" })
        else res.send(user)
    })
}

