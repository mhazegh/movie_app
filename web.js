var express = require('express');
var app = express.createServer(express.logger());
var fs = require('fs');

app.use(express.static(__dirname+'/public'));

app.configure(function(){
  app.use('/', express.static(__dirname + '/'));
});

app.get('/', function(request, response) {
  var buf = fs.readFileSync('index.html');
  response.send(buf.toString());
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
