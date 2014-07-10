var _ = require('lodash');
var path = require('path');
var JiraApi = require('jira').JiraApi;
var config = require('./config');
var subtask = require('./subtask');

/*
  TODO: Write test to all methods
  TODO: Add issue exist checking

  IDEAS: Code review task must be in progress by default
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
  },
  setProject: function(parentTask) {
    subtask.fields.project.key = parentTask.split('-')[0].toUpperCase();
    subtask.fields.parent.key = parentTask.toUpperCase();
  },
  setFields: function(type, index) {
    var current = this.subtasks[type][index];

    if (current) {
      subtask.fields.summary = [type, ': ', current.summary].join('');
      subtask.fields.description = current.description ? current.description : '';

      return subtask;
    } else {
      return false;
    }
  },
  setData: function(data) {
    var that = this;
    var jira = this.getConnect();
    var taskTest = /\w+\-\d+/g;
    var devSubtask, qaSubtask, index;

    if (_.isEmpty(data.parentTask) || !taskTest.test(data.parentTask)) {
      return { error: 'Parent task must not be empy and must be like aloha-747' };
    }

    this.setProject(data.parentTask);

    _.forIn(data, function(value, key) {
      if (_.isEqual(value, 'on')) {
        index = key.split('_')[1];

        if ( key.indexOf('DEV') != -1 ) {
          devSubtask = that.setFields('DEV', index);

          jira.addNewIssue(devSubtask, function(err, body) {
            console.log('DEV subtask is successfully created');
          });
        } else if ( key.indexOf('QA') != -1 ) {
          qaSubtask = that.setFields('QA', index);

          jira.addNewIssue(qaSubtask, function(err, body) {
            console.log('QA subtask is successfully created');
          });
        }
      }
    });

    return {
      uri: path.join('https://contegixapp1.livenation.com/jira/browse/', data.parentTask.toUpperCase())
    }
  }
}