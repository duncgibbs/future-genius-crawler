var express = require("express");
var request = require("request");
var config = require('../config');
var open = require('open');
var app = express();

app.get("/", function(request, response) {
  var authUrl = "https://api.genius.com/oauth/authorize?client_id=" + config.client_id + 
    "&redirect_uri=" + config.redirect_uri + 
    "&scope=vote create_annotation manage_annotation me" + 
    "&state=&response_type=code";
  response.redirect(authUrl);
});


app.get("/callback", function (req, res) {
    var options = {
        url: "https://api.genius.com/oauth/token",
        form: {
            code: req.query.code,
            client_secret: config.client_secret,
            grant_type: "authorization_code",
            client_id: config.client_id,
            redirect_uri: config.redirect_uri,
            response_type: "code"
        }
    };

    request.post(options, function (error, response) {
        var body = JSON.parse(response.body);
        console.log(body.access_token);
        process.exit();
    });
});

app.listen(8000, function() {
    open('http://localhost:8000');
});
