var mongoose = require('mongoose');
var passportLocalMongoose = require("passport-local-mongoose");

var AlertSchema = new mongoose.Schema({
  name: String,
  type: String,
  image: String,
  description: String,
  user: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
  },
});

AlertSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("Alert", AlertSchema);
