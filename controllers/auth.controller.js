const config = require('../config/auth.config')
const db = require('../models/index')
//Access to our db thorugh User and Role variable
const User = db.user
const Role = db.role

//This will give us acess to encode and decode the jwt itself
const jwt = require('jsonwebtoken')
//For hashing / encrypting our passwords
const bcrypt = require('bcryptjs')
const { Roles } = require('../models')

//This will handle stand up 
exports.signup = (req, res) => {
    //we are going to make our user object using the params returned from req
    const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8)
    })
    //we save that user and if there is an error we throw that error
    user.save((err, user) => {
        if (err) {
            res.status(500).send({ message: err })
            return
        }
        //if there is no errors check if roles was passed on req.body
        if (req.body.roles) {
            Role.find({
                name: { $in: req.body.roles }
            }, (err, roles) => {
                if (err) {
                    res.status(500).send({ message: err })
                    return
                }
                //pass roles id from query above to user.roles assigned user and admin
                user.roles = roles.map(role => role._id)
                //save that user
                user.save(err => {
                    if (err) {
                        res.status(500).send({ message: err })
                        return
                    }
                    res.send({ message: "User creates successfully" })
                })
            })
        }else {
            //every user that has no role then it will assign the role and save
            Role.findOne({name: "user"},(err, roles)=>{
                if (err) {
                    res.status(500).send({ message: err })
                    return
                }
                //just assign users roles id to document
                user.roles = [roles._id]

                user.save(err => {
                    if (err) {
                        res.status(500).send({ message: err })
                        return
                    }
                    // res.send(user) 
                    res.send({message: "User was registered successfully"})
                })
            })
        }
    })
}

exports.signin = (req,res) =>{
    console.log("fire")
    User.findOne({
        username: req.body.username
    })
    //populates values from the roles id we stored in the document
    .populate("roles", "-__v")
    //exec returning our user to user
    .exec((err, user)=> {
        if(err) {
            res.status(500).send({message: err})
            return
        }
        //usere did not exist
        if(!user) {
            return res.status(404).send({message: "User not found"})
        }
        //validate the password by passing the req.body password and the password returned from db
        //over to bcrypt to unhash and compare
        const passwordIsValid = bcrypt.compareSync(
            req.body.password,
            user.password //encrypted password saved in db
        )
        //if password is not valid, we returning invalid password
        if(!passwordIsValid){
            return res.status(401).send({accessToken: null, message: "invalid password"})
        }
        //if password is valid we generate a new token
        const token = jwt.sign({id: user._id}, config.secret, {
            expiresIn: 86400 //expires token in 24 hours
        })
        //setting roles to pass back in our response
        let authorities = []

        for(let i =0; i< user.roles.length; i++){
            authorities.push("ROLE_"+ user.roles[i].name.toUpperCase())
        }
        //seeding that response back
        res.status(200).send({
            id: user._id,
            username: user.username,
            email: user.email,
            roles: authorities,
            accessToken: token
        })
    })
}