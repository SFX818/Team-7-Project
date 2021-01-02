//Do we need to require router here?
//const router = require('express').Router()
const controller = require('../controllers/posts.controller')

module.exports = function(app) {
    app.use((req,res, next)=> {
        //set header and allow use of x access token (we will use this to pass our token)
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-type, Accept"
        );
        next();
    })

//Create a new post
app.post("/api/posts/post", controller.makePost)
//Edit an existing post
app.put("/api/posts/post", controller.editPost)
//Delete a post
app.delete("/api/posts/post", controller.deletePost)
// //Post repost/retweet - should get original and display as retweet
app.post("/api/posts/retweet", controller.retweetPost)
// //Reply to post
app.post("/api/posts/reply", controller.replyToPost)
// View all of a user's favorited posts
app.get("/api/posts/feed/favorites/:id",controller.favoritesFeed)
// View all posts from users as user is following
app.get("/api/posts/feed/:id", controller.userFollowing)
//Retreive all of the posts to display on home
app.get("/api/posts/feed", controller.allPosts)
// //Retreive a single post 
app.get("/api/posts/:idx", controller.onePost)

// Increment favorite count of favorited post
app.put("/api/posts/favorite",controller.incrementFavorite)

}



