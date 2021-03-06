
var tasker = require('./tasker');
var login = require('./login');
var express = require('express')
var http = require('http')
var jade = require('jade');
var path = require('path');
var async = require('async');
var bodyParser = require('body-parser');
var app = express();

app.set('port', process.env.PORT || 5353);
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

// Error handling
app.route('/error')
  .get(function(req, res) {
    res.send( jade.renderFile(path.resolve(app.get('templates'), 'error.jade'), { error: app.get('error') }) );
  });

// Login user to Jira
app.route('/login')
  .get(function(req, res) {
    res.send( jade.renderFile(path.resolve(app.get('templates'), 'login.jade')));
  })
  .post(function(req, res) {

    async.series([
      function(cb) {
        login.init(req.body, cb);
      },
      function(cb) {
        // Place where user login to jira successfully
        res.redirect('/');
      }
    ], function(err) {
      if (err) {
        app.set('error', err.toString());
        res.redirect('/error');
      }
    });

  });

// Work with tasks creation
app.route('/')
  .get(function(req, res) {
    if (login.connect) {
      res.send( jade.renderFile(path.resolve(app.get('templates'), 'index.jade'), { tasker: tasker }) );
    } else {
      res.redirect('/login');
    }
  })
  .post(function(req, res) {

    async.series([
      function(cb) {
        tasker.init(req.body, cb);
      },
      function(cb) {
        res.redirect(tasker.getURI()); // Go to ticket URI
      }
    ], function(err) {
      if (err) {
        app.set('error', err.toString());
        res.redirect('/error');
      }
    });

  });

app.listen( app.get('port') );