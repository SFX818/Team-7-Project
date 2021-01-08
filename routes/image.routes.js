const multer = require('multer')
const upload = multer()


const controller = require('../controllers/image.controller');
// const { checkDuplicateUsernameOrEmail } = require('../middlewares/verifySignup');

module.exports = function(app) {
    
    app.use((req,res, next)=> {
        //set header and allow use of x access token (we will use this to pass our token)
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-type, Accept"
        );
        next();
    })
    
    app.post('/api/photo', upload.any(), controller.uploadImage)
    // (req, res) => {
    //     let newImage = new Image()
    //     newImage.img.data = fs.readFileSync(req.file)
    //     newImage.img.contentType = 'image/png'
    //     newImage.save((err) => {
    //     console.log('Image Saved!', newImage._id)
    // })

    // User.findById(req.body.userId, (err, user) => {
    //     user.profilePic.push(newImage._id)
    //     user.save((err) => {
    //         console.log('Image referenced by user!')
    //     })
    // })
    // })
}