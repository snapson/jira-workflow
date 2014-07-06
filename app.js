
var tasker = require('./tasker');
var express = require('express')
var http = require('http')
var jade = require('jade');
var path = require('path');
var reload = require('reload');
var templates = path.resolve(__dirname, 'templates');
var app = express();
var server;

/*
  TODO: Update livereload
  TODO: Create package.json
  TODO: Create route for single page
  TODO: Create view for index route
  TODO: Write tests
  TODO: Include sass in project

  IDEAS: Add caching to project
  IDEAS: Add gziping
  IDEAS: Maybe use Grunt or Bower?
*/

app.set('port', process.env.PORT || 3000);
app.use(express.static(path.resolve(__dirname, 'assets')));

app.get('/', function(req, res) {
  res.send( jade.renderFile(path.resolve(templates, 'index.jade'), { tasker: tasker }) );
});




// For autoreload purposes
server = http.createServer(app);
reload(server, app);
server.listen(app.get('port'), function(){
  console.log("Web server listening on port " + app.get('port'));
});