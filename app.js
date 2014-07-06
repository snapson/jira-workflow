
var tasker = require('./tasker');
var app = require('express')();

/*
  TODO: Create route for single page
  TODO: Create view for index route
  TODO: Use jade for template
  TODO: Use mocha for tests
  TODO: Use chai for tests

  IDEAS: Add caching to project
  IDEAS: Add gziping
*/

app.listen(3000);

app.get('/', function(req, res) {
  res.json(tasker.getSubtasks());
});