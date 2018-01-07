var express         = require('express'),
    app             = express(),
    bodyParser      = require('body-parser'),
    mongoose        = require('mongoose'),
    passport        = require('passport'),
    LocalStrategy   = require('passport-local'),
    twilio          = require('twilio'),
    request         = require('request'),
    Alert           = require('./models/alert'),
    User            = require("./models/user"),
    client          = require('twilio')( process.env.TWILIOSID,process.env.TWILIOAUTHTOKEN);

// routes
var coinRoutes      = require("./routes/coins");

var dbUrl = process.env.DATABASEURL || "mongodb://localhost/bitcoin_alerts";
mongoose.connect(dbUrl,{useMongoClient: true});

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static(__dirname + "/public"));


app.use(require("express-session")({
  secret: "What's the price of bitcoin now now",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.get("/",function(req, res){
  res.render("landing");
});

app.post("/btc", function(req, res){
  var self = req.body;
  var allLower = self.Body.toLowerCase();
  var number = self.From;
  var coin = "BTC";

  if( allLower.includes("bitcoin") || allLower.includes("btc" )){
    coin = "BTC";
  } else if (allLower.includes("ethereum") || allLower.includes("eth")){
    coin = "ETH";
  } else if ( allLower.includes("litecoin") || allLower.includes("ltc")){
    coin = "LTC";
  }
  var options = {
    url: `https://api.coinbase.com/v2/prices/${coin}-USD/spot`,
    headers: {
      'User-Agent': 'request'
    }
  };

  console.log("twilio body: ", self);

  request(options, function(error, response, body){
    if (!error && response.statusCode == 200){
      var info = JSON.parse(body);
      console.log(info);

      client.messages.create({
      to: self.From,
      from: process.env.TWILIOPHONE,
      body: info.data.base + ": $" + info.data.amount,
      },function(err,message){
        console.log(err);
      });
    }
  });
})

app.get("/signup",function(req,res){
  res.render("signup");
})

//signup
app.post("/signup", function(req,res){
  var newUser = new User({username: req.body.username, phone: req.body.phone});
  User.register(newUser, req.body.password, function(err, user){
    if(err){
      // req.flash("error", err.message);
      return res.render('signup');
    }
    passport.authenticate("local")(req,res,function(){
      // req.flash("success", "Welcome to YelpCamp " + user.username);
      res.redirect("/coins");
    });
  });
});

//Login
app.get("/login", function(req,res){
  res.render("login");
});
//handling login logic
app.post("/login", passport.authenticate("local",
 {
   successRedirect: "/campgrounds",
   failureRedirect: "/login"
 }),function(req,res){
});

app.use("/coins", coinRoutes);

app.listen(process.env.PORT || 3000,function(){
  console.log('bitcoin-alerts server started');
})
