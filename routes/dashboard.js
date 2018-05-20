const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Article = require('../models/article');
const Coment = require('../models/comment');
const moment = require('moment');
const multer = require('multer');
const cloudinary = require('cloudinary');
const dotenv = require('dotenv').config();
const cloudinaryStorage = require('multer-storage-cloudinary');

cloudinary.config({
	cloud_name: process.env.cloud_name,
	api_key: process.env.api_key,
	api_secret: process.env.api_secret
});

var storage = cloudinaryStorage({
cloudinary: cloudinary,
folder: 'articlesApp',
allowedFormats: ['jpg', 'png'],
filename: function (req, file, cb) {
	cb(undefined, 'imgSrc' + Date.now());
}
});

let upload = multer({ storage: storage });

//function to run to check if user is in session or not
//restrict accces to certain routes
let requireLogin = function(req,res, next){
  console.log(req.url);
  let full_address = req.protocol + "://" + req.headers.host + req.baseUrl + req.url;
	req.user ? next() : res.redirect('/users/login?' + 'returnTo='+ full_address);
}

/*router.get('/', requireLogin, (req,res,next)=>{
    req.flash('info','Welcome to your dashboard');
    //console.log(req.user);
    res.render('dashboard', {
      title:'Dashboard',
      user:req.user,
      msg:req.flash('info'),
      isLoggedIn:req.user
    });
})*/


// Get user profile
router.get('/:username', async (req,res,next)=>{
  try {
    let user = await User.findOne({username:req.params.username}) //get the displayed user profile
    let TAfollowing = await User.find({followers:user._id}) // count the number of people he is following
    let populatedUser = await User.findOne({username:req.params.username}).populate('followers')
    res.send({user:user,populatedUser:populatedUser,TAfollowing:TAfollowing,});
  } catch (error) {
    console.log(error);
  }
  
  
});

// Create new article
router.post('/:username/create', upload.single('imgSrc'), function(req, res, next){
  req.checkBody('title', 'title cannot be empty').notEmpty();
  req.checkBody('body', 'please enter the main article').notEmpty();
  req.checkBody('category', 'please write a category').notEmpty();

  //Run the validators
  var errors = req.validationErrors();
  //create a new artilce object

  var article = new Article({
    title: req.body.title,
    author: req.body.author,
    body: req.body.body,
    category: req.body.category,
    likes:[],
    tags: req.body.tags,
    date: moment().format("D MMM, YYYY"),
    imgSrc: req.file ? req.file.url : '/assets/noImg.png'
  });


  if(errors){
    //If there are errors render the form again, passing the previously entered values and errors
    res.send('error');
    return;
  }
  else{

    //data from form is valid
    article.save(function(err){
      if(err){return next(err)};
      console.log(req.file);
      console.log(article);

      //article saved. redirect
      res.send(article);
    });
  }


});

// Get my followers
router.get('/:username/followers', async (req,res,next)=>{
  try {
    let user = await User.findOne({username:req.params.username})
    let populatedUser = await  User.findOne({username:req.params.username}).populate('followers')
      console.log('user ' + user);
      console.log(populatedUser);
    res.send({populatedUser:populatedUser});
  } catch (err) {
    console.log(err)
    return
  }
})
// Get all those that the user with ':username' is following
router.get('/:username/following', async (req,res,next)=>{
  try{
    let user = await User.findOne({username:req.params.username})
    let TAfollowing = await  User.find({followers:user._id})// get all the users who have the feautured user on their folower list
      console.log('TAfollowing ' + TAfollowing);
     res.send({TAfollowing:TAfollowing, user:user})
  }
  catch(err){
    console.log(err)
    return 
  }
});


// Get articles
/*router.get('/:username/articles', (req,res,next)=>{
  User.findOne({username:req.params.username}, (err,user)=>{
    Article.find({author:user._id}, (err,articles)=>{
      User.count({followers:user._id},(err,followingCount)=>{
        res.render('articles', {
          title:'User',
          articles:articles,
          profile:user,
          followingCount:followingCount,
          isLoggedIn:req.user
        })
      })
      
    })
  })
}) */

router.get('/:username/articles', async (req,res,next)=>{
  try{
    let user = await User.findOne({username:req.params.username})
    let articles = await Article.find({author:await user._id})
    let followingCount = await User.count({followers: await user._id})
    /*res.render('articles', {
      title:'User',
      articles:articles,
      profile:user,
      followingCount:followingCount,
      isLoggedIn:req.user
    }) */
    res.send({articles:articles, isLoggedIn:req.user ? req.user : false})
  }
  catch(err){
    console.log(err);
    return 
  }


  // Use promise.all to get all the promise at once
  /*Promise.all([
    User.findOne({username:req.params.username}),
    Article.find({author:'5ae1f17e5e804115a08d0214'}),
    User.count({followers:'5ae1f17e5e804115a08d0214'})
  ]).then((results=>{
    console.log(results)
    res.send(results);
  })).catch((err)=>{
    console.log(err);
  })*/

})

// Follow a user
/* router.post('/:username/follow/:userId', requireLogin, (req,res,next)=>{
  User.findOne({_id:req.params.userId}).
  exec((err,user)=>{
    console.log(req.params.userId); 
    console.log(user);
    console.log('you are about to follow someone');
    let followers = user.followers; 
    followers.push(req.user._id)
    User.update({_id:req.params.userId},{followers:followers}, (err,done)=>{
      console.log(done);
      res.send('user followed successfully!');
    });
  });
}); */

router.post('/:username/follow/:userId/:loggedInUserId', async (req,res,next)=>{
  try {
    let user = await User.findOne({_id:req.params.userId})
      let followers = user.followers;
      console.log(user);
      followers.push(req.params.loggedInUserId)
      let done = await User.findOneAndUpdate({_id:req.params.userId}, {followers:followers}, {new: true})
        console.log('you just followed someone');
        console.log(done)
      let user2 = await User.findOne({username:req.params.username})
      let populatedUser = await User.findOne({username:req.params.username}).populate('followers')
        console.log(user2)
      let updatedFollowingList = await User.find({followers:user2._id});
      res.send({user2:user2,populatedUser:populatedUser,updatedFollowingList:updatedFollowingList});
  } catch (error) {
    console.log(error)
  }
    
    
  
})


// Unfollow a user
router.post('/:username/unfollow/:userId/:loggedInUserId', async (req,res,next)=>{
  try {
    let user = await User.findOne({_id:req.params.userId});
      console.log('unfollowing...');
    let followers = user.followers;
    followers.splice(followers.indexOf(req.params.loggedInUserId),1); // remove the 'unfollower' from the clicked user's list of followers
    let done = await User.findOneAndUpdate({_id:req.params.userId},{followers:followers}, {new:true})
    //console.log(done);
    let user2 = await User.findOne({username:req.params.username})
    let populatedUser = await User.findOne({username:req.params.username}).populate('followers')
    let updatedFollowingList = await User.find({followers:user2._id}) // get the latest info about those he is following
      console.log(updatedFollowingList)
    res.send({user2:user2, populatedUser:populatedUser, updatedFollowingList:updatedFollowingList});
  } catch (error) {
      console.log(error)
  }
});

//update followers



module.exports = router;