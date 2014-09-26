var _ = require('lodash');
var path = require('path');
var async = require('async');
var JiraApi = require('jira').JiraApi;
var config = require('./config');

var login = module.exports = {
  credentials: {
    user: '',
    pass: ''
  },
  connect: null,
  handling: function(data, next) {
    _.isEmpty(data.username) && next( new Error('You must fill the username field!') );
    _.isEmpty(data.password) && next( new Error('You must fill the password field!') );

    if (!_.isEmpty(data.username) && !_.isEmpty(data.password)) {
      this.credentials.user = data.username;
      this.credentials.pass = data.password;
      next(); // next() become from init
    }
  },
  loginToJira: function(next) {
    var that = this;

    this.connect = new JiraApi(
      config.protocol,        // protocol<string>
      config.host,            // host<string>
      config.port,            // port<int>
      that.credentials.user,  // user<string>
      that.credentials.pass,  // password<string>
      '2',                    // Jira API Version<string>:  Known to work with 2 and 2.0.alpha1
      true,                   // verbose<bool>
      true                    // strictSSL<bool>
    );

    next(); // Become from init
  },
  checkLogin: function(next) {
    this.connect.listFields(function(err, data) {
      next(err && new Error('Your login is incorrect, try to login with correct information')); // next() become from init
    });
  },
  init: function(data, done) {
    var that = this;

    async.series([
      function(next) {
        that.handling(data, next);
      },
      function(next) {
        that.loginToJira(next);
      },
      function(next) {
        that.checkLogin(next);
      }
    ], function(err) {
      done(err); // done() become from app.js
    });
  }
};