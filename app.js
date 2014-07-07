
var tasker = require('./tasker');
var express = require('express')
var http = require('http')
var jade = require('jade');
var path = require('path');
var app = express();

/*
  TODO: Add livereload
  TODO: Write tests
  TODO: Include sass in project
  TODO: Create package.json

  IDEAS: Add caching to project
  IDEAS: Add gziping
  IDEAS: Maybe use Grunt or Bower?
*/

app.set('port', process.env.PORT || 3000);
app.set('views', path.resolve(__dirname, 'views'));
app.set('templates', path.resolve(__dirname, 'templates'));
app.set('assets', path.resolve(__dirname, 'assets'));

app.use(express.static( app.get('assets') ));
app.use(function(err, req, res, next){
    res.status(err.status || 500);
    log.error('Internal error(%d): %s',res.statusCode,err.message);
    res.send({ error: err.message });
    return;
});
app.use(function(req, res, next){
  console.log('%s %s', req.method, req.url);
  next();
});

app.get('/', function(req, res) {
  res.send( jade.renderFile(path.resolve(app.get('templates'), 'index.jade'), { tasker: tasker }) );
});

app.listen( app.get('port') );