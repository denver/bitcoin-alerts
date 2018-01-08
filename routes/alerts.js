var express = require("express");
var router = express.Router();
var twilio = require('twilio');
var Alert = require('../models/alert');

//index
// router.get("/", function(req, res){
//       res.render("alerts/index");
// });

//INDEX
router.get("/", function(req, res){
  //get all campgrounds from db
  Alert.find({}, function(err, allAlerts){
    if(err){
      console.log(err);
    } else {
      res.render("alerts/index", {alerts: allAlerts});
    }
  });
});

//new campground form
router.get("/new", function(req, res){
  res.render("alerts/new");
});

//create
router.post("/", function(req, res){
  //get data from form
  var name = req.body.name;
  var type = req.body.type;
  var image = req.body.image;
  var desc = req.body.description;
  // var author = {
  //   id: req.user._id,
  //   username: req.user.username
  // };
  var newAlert = {name: name,type: type,image:image, description: desc};
  // create a new campground and save to db
  Alert.create(newAlert, function(err, newlyCreated){
    if(err){
      console.log(err);
    } else {
      console.log(newlyCreated);
      res.redirect("/alerts");
    }
  })
});

// POST: /commuter/use-sms
router.post('/use-sms', twilio.webhook({ validate: false }), function (req, res) {
  from = req.body.From;
  to   = req.body.To;
  body = req.body.Body;

  gatherOutgoingNumber(from, to)
  .then(function (outgoingPhoneNumber) {
    var twiml = new twilio.TwimlResponse();
    twiml.message(body, { to: outgoingPhoneNumber });

    res.type('text/xml');
    res.send(twiml.toString());
  })
});

// POST: /commuter/use-voice
router.post('/use-voice', twilio.webhook({ validate: false }), function (req, res) {
  from = req.body.From;
  to   = req.body.To;
  body = req.body.Body;

  gatherOutgoingNumber(from, to)
  .then(function (outgoingPhoneNumber) {
    var twiml = new twilio.TwimlResponse();
    twiml.play('http://howtodocs.s3.amazonaws.com/howdy-tng.mp3');
    twiml.dial(outgoingPhoneNumber);

    res.type('text/xml');
    res.send(twiml.toString());
  })
});

var gatherOutgoingNumber = function (incomingPhoneNumber, anonymousPhoneNumber) {
  var phoneNumber = anonymousPhoneNumber;

  return Alert.findOne({ phoneNumber: phoneNumber })
  .deepPopulate('property property.owner guest')
  .then(function (Alert) {
    var hostPhoneNumber = formattedPhoneNumber(Alert.property.owner);
    var guestPhoneNumber = formattedPhoneNumber(Alert.guest);

    // Connect from Guest to Host
    if (guestPhoneNumber === incomingPhoneNumber) {
      outgoingPhoneNumber = hostPhoneNumber;
    }

    // Connect from Host to Guest
    if (hostPhoneNumber === incomingPhoneNumber) {
      outgoingPhoneNumber = guestPhoneNumber;
    }

    return outgoingPhoneNumber;
  })
  .catch(function (err) {
    console.log(err);
  });
}

var formattedPhoneNumber = function(user) {
  return "+" + user.countryCode + user.areaCode + user.phoneNumber;
};

module.exports = router;
