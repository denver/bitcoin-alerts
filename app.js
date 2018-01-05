var express         = require('express'),
    app             = express(),
    bodyParser      = require('body-parser'),
    mongoose        = require('mongoose'),
    passport        = require('passport'),
    LocalStrategy   = require('passport-local'),
    twilio          = require('twilio'),
    request         = require('request'),
    client          = require('twilio')( process.env.TWILIOSID,process.env.TWILIOAUTHTOKEN);

// routes
var coinRoutes      = require("./routes/coins");

mongoose.connect("mongodb://localhost/bitcoin_alerts",{useMongoClient: true});
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static(__dirname + "/public"));

// passport config
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

// app.get("/coins",function(req,res){
//   res.render("coins");
// });

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

app.use("/coins", coinRoutes);

app.listen(process.env.PORT || 3000,function(){
  console.log('bitcoin-alerts server started');
})
