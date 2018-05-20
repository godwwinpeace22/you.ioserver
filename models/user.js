var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');
var UserSchema = new Schema({
  name:String,
  username:String,
  email:String,
  password:{type:String,bcrypt:true},
  imgSrc:String,
  followers:[{type:Schema.Types.ObjectId, ref:'User'}],
  following:[{type:Schema.Types.ObjectId, ref:'User'}]
});
const User = mongoose.model('User', UserSchema);

module.exports = User;
