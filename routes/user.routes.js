const {authJwt} = require('../middlewares')
const controller = require('../controllers/user.controller')

module.exports = function(app) {
    
    app.use((req,res, next)=> {
        //set header and allow use of x access token (we will use this to pass our token)
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-type, Accept"
        );
        next();
    })
    
    app.get("/api/test/all", controller.allAccess)
   
    app.get("/api/test/user", [authJwt.verifyWebToken], controller.userBoard)

    app.get("/api/test/admin", [authJwt.verifyWebToken, authJwt.isAdmin], controller.adminBoard)
    //User profile to display
    app.get("/api/user/profile", controller.userProfile)
    //Follow a user - add route to user so it shows that they are following another
    app.put("/api/user/follow", controller.follow)
    //Unfollow a user
    app.put("/api/user/unfollow", controller.unfollow)
}