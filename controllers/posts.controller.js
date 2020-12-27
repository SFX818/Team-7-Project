const db = require('../models/index')
//Access to our db thorugh User and Role variable
const User = db.user
const Post = db.post

//make a post
exports.makePost = (req, res) => {
    //creating post object
    const post = new Post({
        // creator: req.body.creator, 
        body: req.body.body,
        favorites: 0,
        favoritedBy: [],
        reposts: 0,
        repostedBy: [],
        replies: [],
        hashtags: req.body.hashtags,
        isRepost: false,
        isReply: false,
        parentPost: null
    })

    //Reference the user as the creator of the new post
    post.creator.push(req.body.creator)

    //Find the user and add user as creator to the post
    User.findById(req.body.creator, (err, user) => {
        user.posts.push(post._id)
        user.save()
    })
    
    //Testing to see if we are correctly referencing post ids
    User.findById(req.body.creator).populate('posts').
    exec((err, user) => {
        if (err) {
            console.log(err)
            return
        }
        console.log(user)
    })

    //Save the new post
    post.save((err) => {
        if (err) {
            res.status(500).send({message: err})
        }
        res.send("Post created successfully.")
    })
    
        // User.find({
        //     _id: { $in: req.body.creator }
        // }, (err, users) => {
        //     if (err) {
        //         res.status(500).send({ message: err })
        //         return
        //     }
        //     //set the reference to the user as the creator of post
        //     post.creator = users.map(user => user._id)
        //     //save post to database
        //     post.save((err) => {
        //         if (err) {
        //             res.status(500).send({message: err})
        //         } 
        //         res.send("Post created successfully.")
        //     })
        //     // console.log(req.body.user)
        //     // console.log(req.body.hashtags)
        //     console.log(post)
        //     //when testing is done we need to 
        //     // res.send(post)
        // })   
}

//edit post - to test add the _id of the post and update the post body
exports.editPost= (req, res) => {
    const id = req.body._id
    Post.updateOne({_id: id}, {
        body: req.body.body
    }).then((data)=> {
        if (!data)
        return res.status(400).send({message: "Unable to update post"})
        else res.send(data)
    })
}


//delete post
exports.deletePost = (req,res) => {
    const id = req.body._id
    Post.deleteOne({_id: id})
    .then((data)=>{
        if(!data)
        return res.status(400).send({message: "Unable to delete post"})
        else res.send(data)

    })
}


exports.userFollowing = (req, res) => {
    
    let userFollowingArray = []
    
    User.findById(req.body.creator, (err, user) => {
        if (err) {
            res.status(500).send({ message: err })
            return
        }

        userFollowingArray = user.followed
        console.log(user)
        console.log('USER FOLLOWING ARRAY -->', userFollowingArray)
        console.log('USER FOLLOWING ARRAY LENGTH -->', userFollowingArray.length)
    
    }).then(() => {
    
    
    if(userFollowingArray.length > 0) {
        userFollowingArray.forEach(follower => 
        Post.find({
            creator: { $eq: follower }
        })
        )
        res.send({message: 'Posts retrieved'})
        //console.log(res)
    } else {
        console.log('USER FOLLOWING ARRAY LENGTH -->', userFollowingArray.length)
        res.send({ message: 'You are not following anyone' })
    }
    }
    )
    
}

//route to display all posts "/api/posts/feed" 
exports.allPosts = (req, res) => {
    Post.find()
    .then((data)=> {
        res.send(data)
    })
    .catch((err) => {
        res.status(500).send({
            message: err || "Some error occured while retreiving tutorials"
        })
    })
}

//route to display one post only "/api/posts/:id"
exports.onePost = (req, res) => {
    const id = req.params.idx
    console.log(id)
    Post.find({_id: id})
    .then((post)=>{
        if(!post)
        return res.status(400).send({message: "Cannot find this post"})
        else res.send(post)
    })
}


