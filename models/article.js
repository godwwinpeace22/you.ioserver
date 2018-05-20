var mongoose = require('mongoose');
//define a schema
var Schema = mongoose.Schema;
var ArticleSchema = new Schema({
  title:String,
  author:{type:Schema.Types.ObjectId, ref:'User'},
  body:String,
  date:String,
  imgSrc:String,
  category:String,
  tags:String,
  likes:[{type:Schema.Types.ObjectId, ref:'User'}]
});

module.exports = mongoose.model('Article', ArticleSchema);

