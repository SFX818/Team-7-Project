const db = require('../models/index')
const { populate } = require('../models/user.model')
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
        if (err) {
            console.log(err)
        }
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
            res.status(500).send({ message: err })
        }
        res.send("Post created successfully.")
    })
}
//edit post - to test add the _id of the post and update the post body
exports.editPost = (req, res) => {
    const id = req.body.id
    Post.updateOne({ _id: id }, {
        body: req.body.body
    }).then((data) => {
        if (!data)
            return res.status(400).send({ message: "Unable to update post" })
        else res.send(data)
    })
}
//delete post
exports.deletePost = (req, res) => {
    const id = req.body._id
    Post.deleteOne({ _id: id })
        .then((data) => {
            if (!data)
                return res.status(400).send({ message: "Unable to delete post" })
            else res.send(data)

        })
}
//route to get posts created by a user that current user follows
exports.userFollowing = (req, res) => {

    //grab id from req.params
    User.findById(req.params.id).
        populate({
            path: 'followed',
            populate: {
                path: 'posts',
                model: 'Post',
                populate: {
                        path: 'creator',
                        model: 'User'
                    }
            }
        }).
        exec((error, posts) => {
            if (error) {
                res.status(500).send({ message: error })
                return
            }
            res.send(posts)
        })

}
//route to display all posts "/api/posts/feed" 
exports.allPosts = (req, res) => {
    Post.find().
        populate({
            path: 'creator',
            model: 'User'
        })
        .then((data) => {
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
    Post.find({ _id: id })
        .then((post) => {
            if (!post)
                return res.status(400).send({ message: "Cannot find this post" })
            else res.send(post)
        })
}
//route to create a retweet post
exports.retweetPost = (req, res) => {
    //res.send({message: "Retweet post created"})
    //create post object with isRepost set to true
    const post = new Post({

        creator: req.body.creator,
        body: req.body.body,
        favorites: 0,
        favoritedBy: [],
        reposts: 0,
        repostedBy: [],
        replies: [],
        hashtags: req.body.hashtags,
        isRepost: true,
        isReply: false,
        parentPost: req.body.parentPost
    })
    //Find the user and add user as creator to the post
    User.findById(req.body.creator, (err, user) => {
        if (err) {
            res.status(500).send({ message: err })
            return
        }
        user.posts.push(post._id)


        post.save((err) => {
            if (err) {
                res.status(500).send({ message: err })
            }
            res.send("Post created successfully.")
        })

        user.save((err) => {
            if (err) {
                res.status(500).send({ message: err })
            }
            console.log("Retweet saved to user's posts array successfully.")
        })

    })
    /*
        User.find({
            _id: { $in: req.body.creator }
        }, (err, users) => {
            if (err) {
                res.status(500).send({ message: err })
                return
            }
            //set the reference to the user as the creator of post
            post.creator = users.map(user => user._id)
            //save post to database
            post.save((err) => {
                if (err) {
                    res.status(500).send({message: err})
                } 
                res.send("Post created successfully.")
            })
            //add post to user's post array on model
            
            users[0].posts.push(post._id)
            console.log('USER INFO', users[0], post._id)
            users[0].save()
            // console.log(req.body.user)
            // console.log(req.body.hashtags)
            console.log(post)
            
        })
    */
    //Increment repost count on parent post by 1
    Post.findByIdAndUpdate(req.body.parentPost, { $inc: { reposts: 1 } }, (err, post) => {
        if (err) {
            res.status(500).send({ message: err })
            return
        }
    })
}

//increase favorite count of favorited post by one and user's id to favoritedPosts array on Post
exports.incrementFavorite = (req, res) => {
    Post.findByIdAndUpdate(req.body.id, { $inc: { favorites: 1 }, $push: { favoritedBy: req.body.userId } },
        (err, post) => {
            if (err) {
                res.status(500).send({ message: err })
                return
            }
            console.log(req.body)
            //res.send("Favorite count increased by one, user added to favoritedBy array")
        })

    User.findByIdAndUpdate(req.body.userId, { $push: { favoritePosts: req.body.id } }, (err, post) => {
        if (err) {
            res.status(500).send({ message: err })
            return
        }
        res.send("Post added to User's favorite posts array")
    })
}

//increase favorite count of favorited post by one and user's id to favoritedPosts array on Post
exports.decreaseFavorite = (req, res) => {
    Post.findByIdAndUpdate(req.body.id, {$inc: {favorites: -1}, $pull: {favoritedBy: req.body.userId}}, 
        (err, post) => {
        if (err) {
            res.status(500).send({ message: err })
            return
        } 
        console.log(req.body)
        //res.send("Favorite count decrease by one, user pulled from favoritedBy array")
    })

    User.findByIdAndUpdate(req.body.userId, {$pull: {favoritePosts: req.body.id}},(err, post) => {
        if (err) {
            res.status(500).send({ message: err })
            return
        }
        res.send("Post removed from User's favorite posts array")
    })
}

//retrieve a user's favorite posts to display in a favorites feed
exports.favoritesFeed = (req, res) => {
    //grab id from req.params
    User.findById(req.params.id).
        populate({
            path: 'favoritePosts',
            populate: {
                path: 'creator',
                model: 'User'
            }
        }).
        exec((error, posts) => {
            if (error) {
                res.status(500).send({ message: error })
                return
            }
            res.send(posts)
        })
}
// make a reply
exports.replyToPost = (req, res) => {
    // res.send ({ message: "Reply has been Posted"})
    console.log(req.body)
    //creating a reply object (make sure isReply is set to true)
    const reply = new Post({
        creator: req.body.creator,
        body: req.body.body,
        favortes: 0,
        favoritedBy: [],
        reposts: 0,
        repostedBy: [],
        replies: [],
        hastags: req.body.hashtags,
        isRepost: false,
        isReply: true,
        parentPost: req.body.parentPost
    })

    // Find the user and add user as creator to the reply
    User.findById(req.body.creator, (err, user) => {
        if (err) {
            res.status(500).send({ message: err })
            return
        }
        user.posts.push(reply._id)

        reply.save((err) => {
            if (err) {
                res.status(500).send({ message: err })
            }
            // res.send("Post created successfully.")
        })

        user.save((err) => {
            if (err) {
                res.status(500).send({ message: err })
            }
            console.log("Reply saved to user's posts array successfully.")
        })

    })

    // trying to find the parentPost (id) to attach to the reply to the parent post's replies array
    Post.findByIdAndUpdate(req.body.parentPost, { $push: { replies: reply._id }},  (err, post) => {
        if (err) {
            res.status(500).send({ message: err })
            return
        }
        res.send("parent post has reply id in array")
    })
    // Post.findById(req.body.parentPost, (err, post) => {
    //     if (err) {
    //         res.status(500).send({ message: err })
    //         return
    //     }
    //     post.replies.push(reply._id)
    // })



}