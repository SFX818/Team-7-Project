const db = require('../models/index')
const Image = require("../models/image.model")

const User = db.user

exports.uploadImage = (req, res) => {
    let newImage = new Image()
    newImage.img.data = req.files[0].buffer 
    //mimetime tells you what kind of file Multipurpose Internet Mail Extensions
    newImage.img.contentType = req.files[0].mimetype
    newImage.save((err) => {
        console.log('Image Saved!', newImage._id)
    })

    User.findByIdAndUpdate(req.body.userId, {profilePic: newImage._id}, (err, user) => {
        // user.profilePic.updateOne(newImage._id)
        // user.save((err) => {
        //     console.log('Image referenced by user!')
        // })
        res.send(user)
    })
}

