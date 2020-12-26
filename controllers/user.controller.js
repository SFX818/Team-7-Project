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

//display user profile
exports.userProfile = (req, res) => {
    const id= req.body._id
    User.find({_id: id}).then((user)=>{
        if(!user)
        return res.status(400).send({message: "Profile not found" })
        else res.send(user)
    })
}