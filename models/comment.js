var mongoose = require('mongoose');
//define a schema
var Schema = mongoose.Schema;

var CommentSchema = new Schema({
  title: {type:String},
  commenter:{type:Schema.Types.ObjectId, ref:'User'},
  body:{type:String},
  refArticle:{type:Schema.Types.ObjectId, ref:'Article'},
  date:{type:String}
});

var Coment = mongoose.model('Coment', CommentSchema);
module.exports = Coment;
