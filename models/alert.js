var mongoose = require('mongoose');

var alertSchema = new mongoose.Schema({
  name: String,
  type: String,
  description: String,
  user: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
  },
});

module.exports = mongoose.model("Alert", alertSchema);
