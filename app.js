var JiraApi = require('jira').JiraApi;
var config = require('./config');
var _;
var express;
var jira = new JiraApi(config.protocol, config.host, config.port, config.user, config.password, '2', true, true);

/*
  TODO: Add lodash
  TODO: Add express
  TODO: Create route for single page
  TODO: Create view for index route
  TODO: Add method that allow to create subtasks to the parent task
  TODO: Write test to all methods

  IDEAS: Code review task must be inProgress by default
  IDEAS: Write fixversion to input by hands
  IDEAS: Write parent task to input too
  IDEAS: Select neccessary subtasks like checkboxes
  IDEAS: Write assignee person by hand
  IDEAS: Get all assignee persons from jira api
*/

var creator = function() {
  this.subtasks = {
    DEV: [
      { summary: 'Create branch', description: 'Create new branch for issue.' },
      { summary: 'Modify layout', description: 'Modify neccessary layout.' },
      { summary: 'Modify tests', description: 'Modify neccessary tests.' },
      { summary: 'Code review', description: 'Pass code review.' },
      { summary: 'Test cases', description: 'Write some test cases' },
      { summary: 'Merge to master', description: 'Merge code to astro gitlab.' }
    ];
    QA: [
      { summary: 'Acceptance testing', description: '' },
      { summary: 'Integration testing', description: '' }
    ];
  };
};