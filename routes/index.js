const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Article = require('../models/article');
const Coment = require('../models/comment');
const moment = require('moment');
//var bodyParser = require('body-parser');
const multer  = require('multer');
const session = require('express-session');
//store uploaded files to diskStorage
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    let arr = file.mimetype.split('/');
    let extension = arr[arr.length - 1];
    cb(null, file.fieldname + Date.now() + '.' + extension)
  }
})

let upload = multer({ storage: storage })


//function to run to check if user is in session or not
//restrict accces to certain routes
let requireLogin = function(req,res, next){
	req.user ? next() : res.redirect('/users/login');
}


/* GET home page. */
router.get('/', function(req, res){
  Article.find({}).sort({date: 1}).
  populate('author').
  exec(function (err, result) {
    if (err) throw err;
    //Successful, so render
    //res.render('index', { title: 'Articles', articles: result, isLoggedIn:req.user});
    console.log("docs " + result);
    console.log('user ' + req.user)
    res.send({articles:result, isLoggedIn:req.user ? req.user : false})
    //console.log("docs " + result);
  });
});


//posting comments
router.post('/articles/:id', function(req, res, next){
    req.checkBody('title', 'this field cannot  be empty').notEmpty;
    req.checkBody('body', 'this field cannot  be empty').notEmpty;

    //run validation
    var errors = req.validationErrors();
    var comment = new Coment({
      title: req.body.title,
      commenter: req.body.commenter,
      body: req.body.body,
      refArticle: req.params.id,
      date: moment().format("D MMM YYYY")
    });

    if(errors){
      res.send('error in the form!')
    }

    else{
      comment.save(function(err){
        if(err){return next(err)};
        console.log(comment);
          Coment.find({'refArticle': req.params.id}).
          populate('commenter').
          exec(function(err, comments){
            res.send(comments)
        });
      });
    }//end else

});

// Read full article
router.get('/articles/:id', (req, res,next)=>{
  Article.findOne({'_id':req.params.id}).
    populate('author').
    exec(function(err,article){
      let liked = req.user == '' || req.user == undefined || req.user == null? 
        false :  // if the user is not logged in just set it to false
        article.likes.indexOf(req.user._id) != -1 ? // if he is logged in check if he has liked the article already and set it to false if otherwise
        true : false
      if(err) throw err
      Coment.find({'refArticle': req.params.id}).
      populate('commenter').
      exec(function(err, comments){
        console.log(article);
        
        res.send({article:article,comments:comments})
      });
    });
}); 

// like articles
router.post('/articles/:articleId/like/:loggedInUserId', async (req,res,next)=>{
  try {
    let article = await Article.findOne({_id:req.params.articleId})
    let likes = article.likes
    if(err) throw err;
    if(likes.indexOf(req.params.loggedInUserId) != -1){
      // i.e if the id of the user is found in the Likes 
      likes.splice(likes.indexOf(req.params.loggedInUserId),1);
      let done = await Article.findOneAndUpdate({_id:req.params.articleId},{likes:article.likes} ,{new:true})
      res.send(done);
    }
    else{ //datab,params,result,field
      // i.e if the id of the user is not found in the likes
        likes.push(req.params.loggedInUserId);
        let result = await Article.findOneAndUpdate({_id:req.params.articleId},{likes:article.likes},{new:true})
        console.log(result);
        res.send(result);
    }
  } catch (error) {
    throw new Error('something happened :( '  + error)
  }
        
});

router.get('/category/:category', function(req, res, next){
  Article.find({'category':req.params.category.split('-').join(' ')},function(err, result){
    if(err) throw err;
    console.log(result);
    res.render('index', {title:'Articles | Categories', articles:result, msg: result.length + ' results found for this category', isLoggedIn:req.user});

  });
});

// ======= BUS STOP ======= //


module.exports = router;












/*let almightyUpdater = function(collectn,srchParams,field){
    collectn.findOne({_id:srchParams})
    .exec((err,result)=>{
      field = result.field
      if(err) throw err;
      if(field.indexOf(req.user._id) != -1){
        console.log('You have followed this user already so lets unfollow him/her for you');
        field.splice(field.indexOf(req.user._id), 1);
        console.log(field);
        let update = {field:result.field};
        let  query = {_id:srchParams}
        collectn.update(query,update, (err,done)=>{
          console.log(done);
          res.send('Removed');
        });
      }
      else{
        // i.e if the id of the user is not found in the likes
        field.push(req.user._id);
        let update = {field:result.field};
        let query = {_id:srchParams}
        collectn.update(query,update,(err,done)=>{
          console.log(done);
          res.send('Added');
        })
      }
    })
  } */