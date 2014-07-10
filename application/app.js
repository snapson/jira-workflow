
var tasker = require('./tasker');
var express = require('express')
var http = require('http')
var jade = require('jade');
var path = require('path');
var bodyParser = require('body-parser');
var app = express();

/*
  TODO: Open task in new tab
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
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
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

app.route('/')
  .get(function(req, res) {
    res.send( jade.renderFile(path.resolve(app.get('templates'), 'index.jade'), { tasker: tasker }) );
  })
  .post(function(req, res) {
    var created = tasker.setData(req.body);

    if ( created && created.error ) {
      res.send( jade.renderFile(path.resolve(app.get('templates'), 'error.jade'), { error: created.error }) );
    } else {
      // TODO: remove this
      setTimeout(function() {
        res.redirect(created.uri);
      }, 2000);
    }
  });

app.listen( app.get('port') );