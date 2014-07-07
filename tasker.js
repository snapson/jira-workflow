var _ = require('lodash');
var JiraApi = require('jira').JiraApi;
var config = require('./config');

/*
  TODO: Add method that allow to create subtasks to the parent task
  TODO: Write test to all methods

  IDEAS: Code review task must be in progress by default
  IDEAS: Write fixversion to input by hands
  IDEAS: Write parent task to input too
  IDEAS: Select neccessary subtasks like checkboxes
  IDEAS: Write assignee person by hand
  IDEAS: Get all assignee persons from jira api
*/

var tasker = module.exports = {
  subtasks: {
    DEV: [
      { summary: 'Create branch', description: 'Create new branch for issue.' },
      { summary: 'Modify layout', description: 'Modify neccessary layout.' },
      { summary: 'Modify tests', description: 'Modify neccessary tests.' },
      { summary: 'Code review', description: 'Pass code review.' },
      { summary: 'Test cases', description: 'Write some test cases' },
      { summary: 'Merge to master', description: 'Merge code to astro gitlab.' }
    ],
    QA: [
      { summary: 'Acceptance testing' },
      { summary: 'Integration testing' },
      { summary: 'Demo' }
    ]
  },
  init: function() {},
  getSubtasks: function() { return this.subtasks; },
  getConnect: function() {
    return new JiraApi(
      config.protocol,  // protocol<string>
      config.host,      // host<string>
      config.port,      // port<int>
      config.user,      // user<string>
      config.password,  // password<string>
      '2',              // Jira API Version<string>:  Known to work with 2 and 2.0.alpha1
      true,             // verbose<bool>
      true              // strictSSL<bool>
    );
  }
}