var _ = require('lodash');
var path = require('path');
var async = require('async');
var JiraApi = require('jira').JiraApi;
var config = require('./config');
var subtask = require('./subtask');

/*
  TODO: Code review task must be in progress by default
  TODO: User auth before task creating
  TODO: Write test to all methods
  TODO: Add issue exist checking

  IDEAS: Write assignee person by hand
  IDEAS: Get all assignee persons from jira api
*/

var tasker = module.exports = {
  project: null,
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
  getAllSubtasks: function() { return this.subtasks; },
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
  getURI: function() {
    return path.join('https://contegixapp1.livenation.com/jira/browse/', this.project);
  },
  setProject: function(parentTask, done) {
    subtask.fields.project.key = parentTask.split('-')[0].toUpperCase();
    subtask.fields.parent.key = parentTask.toUpperCase();
    this.project = parentTask.toUpperCase();
    done();
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
  setSelectedSubtasks: function(data, done) {
    var that = this;
    var index;
    var selected = {
      DEV: [],
      QA: []
    };

    _.forIn(data, function(value, key) {
      if (_.isEqual(value, 'on')) {
        index = key.split('_')[1];

        if ( key.indexOf('DEV') != -1 ) {
          selected.DEV.push(that.subtasks['DEV'][index]);
        } else if ( key.indexOf('QA') != -1 ) {
          selected.QA.push(that.subtasks['QA'][index]);
        }
      }
    });

    that.selectedSubtasks = selected;
    done();
  },
  createTasks: function(done) {
    var that = this;

    async.series([
      function(cb) {
        that.createTask(that.selectedSubtasks.DEV, 'DEV', cb);
      },
      function(cb) {
        that.createTask(that.selectedSubtasks.QA, 'QA', cb);
      }
    ], function(err, resp) {
      console.log('Complete creating all tasks');
      done();
    });
  },
  createTask: function(tasks, type, done) {
    var that = this;
    var jira = this.getConnect();
    var count = 0;

    async.whilst(
      function () { return count <= (tasks.length - 1); },
      function (callback) {
        jira.addNewIssue(that.setFields(type, count), function(err, body) {
          if (!err) {
            console.log('Subtask is successfully created');
            count++;
            callback();
          } else {
            console.log('Some error is occured');
          }
        });
      },
      function (err) {
        err && (console.log('Some error is occured', err));
        !err && (done());
      }
    );
  },
  setData: function(data, done) {
    var that = this;
    var taskTest = /\w+\-\d+/g;

    if (_.isEmpty(data.parentTask) || !taskTest.test(data.parentTask)) {
      return { error: 'Parent task must not be empy and must be like aloha-747' };
    }

    async.series([
      function(cb) {
        that.setProject(data.parentTask, cb);
      },
      function(cb) {
        that.setSelectedSubtasks(data, cb);
      },
      function(cb) {
        that.createTasks(cb);
      }
    ], function(err, resp) {
      if (!err) {
        console.log('Complete all work with tasker');
        done(); // Become from app.js
      }
    });

  }
}