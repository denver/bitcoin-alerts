var mongoose = require('mongoose');
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
  username: String,
  phone: String,
  password: String,
  alerts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Alert"
    }
  ]
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
