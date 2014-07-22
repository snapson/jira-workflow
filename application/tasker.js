var _ = require('lodash');
var path = require('path');
var async = require('async');
var JiraApi = require('jira').JiraApi;
var config = require('./config');
var subtask = require('./subtask');

/*
  TODO: Add user login to jira
  TODO: Write test to all methods
  TODO: Add issue exist checking

  IDEAS: Write assignee person by hand
  IDEAS: Get all assignee persons from jira api
*/

var tasker = module.exports = {
  project: null,
  baseURI: 'https://contegixapp1.livenation.com/jira/browse/',
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
  getURI: function() { return path.join(this.baseURI, this.project); },
  setProject: function(parentTask, done) {
    subtask.fields.project.key = parentTask.split('-')[0].toUpperCase();
    subtask.fields.parent.key = parentTask.toUpperCase();
    this.project = parentTask.toUpperCase();
    done(); // Become from init
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
    done(); // Become from init
  },
  createTasks: function(done) {
    var that = this;

    async.series([
      function(cb) {
        that.createSingleTask(that.selectedSubtasks.DEV, 'DEV', cb);
      },
      function(cb) {
        that.createSingleTask(that.selectedSubtasks.QA, 'QA', cb);
      }
    ], function(err, resp) {
      console.log('Complete creating all tasks');
      done(); // Become from init
    });
  },
  createSingleTask: function(tasks, type, done) {
    var that = this;
    var jira = that.getConnect();
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
        !err && (done()); // Become from createTasks
      }
    );
  },
  checkData: function(data, next) {
    var parentTest = /\w+\-\d+/g;

    if (_.isEmpty(data.parentTask) || !parentTest.test(data.parentTask)) {
      next( new Error('Parent task must not be empy and must be like aloha-747.') ); // Become from init
    }

    if (_.indexOf(_.values(data), 'on') < 0) {
      next( new Error('You must select one or more tasks.') ); // Become from init
    }

    next();
  },
  init: function(data, done) {
    var that = this;

    async.series([
      function(cb) {
        that.checkData(data, cb);
      },
      function(cb) {
        that.setProject(data.parentTask, cb);
      },
      function(cb) {
        that.setSelectedSubtasks(data, cb);
      },
      function(cb) {
        that.createTasks(cb);
      }
    ], function(err) {
      if (!err) {
        console.log('Complete all work with tasker');
        done(); // Become from app.js
      } else {
        console.log('Error is occured ', err);
        done(err); // Become from app.js
      }
    });
  }
}