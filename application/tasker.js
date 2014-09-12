var _ = require('lodash');
var path = require('path');
var async = require('async');
var config = require('./config');
var subtask = require('./subtask');
var login = require('./login');

/*
  TODO: Write test to all methods
  TODO: Add issue exist checking

  IDEAS: Write assignee person by hand
  IDEAS: Get all assignee persons from jira api
*/

var tasker = module.exports = {
  project: null,
  projects: null,
  isEqualProjects: false,
  allWorkIsDone: false,
  baseURI: 'https://contegixapp1.livenation.com/jira/browse/',
  subtasks: {
    DEV: [
      { summary: 'Create branch', description: 'Create new branch for issue.' },
      { summary: 'Modify layout', description: 'Modify neccessary layout.' },
      { summary: 'Modify tests', description: 'Modify neccessary tests.' },
      { summary: 'Code review', description: 'Pass code review.' },
      { summary: 'Test cases', description: 'Write some test cases' },
      { summary: 'Merge to master', description: 'Merge code to astro gitlab.' },
      { summary: 'Merge to develop', description: 'Merge code to svn develop' }
    ],
    QA: [
      { summary: 'Acceptance testing' },
      { summary: 'Integration testing' },
      { summary: 'Demo' }
    ]
  },
  getAllSubtasks: function() { return this.subtasks; },
  getURI: function() { return false; /* path.join(this.baseURI, this.project); */ },
  setProjects: function(done) {
    var that = this;

    _(that.projects).forEach(function(prjct) {
      that.setProject(prjct, done);
    });

    this.allWorkIsDone = true;
  },
  setProject: function(parentTask, done) {
    subtask.fields.project.key = parentTask.split('-')[0].toUpperCase(); // ALOHA
    subtask.fields.parent.key = parentTask.toUpperCase(); // ALOHA-757
    this.project = parentTask.toUpperCase(); // ALOHA-757
    done(); // Become from setProjects
  },
  setFields: function(type, summ) {
    var current = _.find(this.subtasks[type], { summary: summ });

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

      if (this.isEqualProjects || this.allWorkIsDone) {
        console.log('Complete creating all tasks');
        done(); // Become from init
      } else {
        console.log('Another project will go');
        that.createTasks(done);
      }

    });
  },
  createSingleTask: function(tasks, type, done) {
    // var that = this;
    // var jiraConnect = login.connect;
    // var count = 0;

    // async.whilst(
    //   function () { return count <= (tasks.length - 1); },
    //   function (callback) {
    //     jiraConnect.addNewIssue(that.setFields(type, tasks[count].summary), function(err, body) {
    //       if (!err) {
    //         console.log('Subtask is successfully created');
    //         count++;
    //         callback();
    //       } else {
    //         console.log('Some error is occured');
    //       }
    //     });
    //   },
    //   function (err) {
    //     err && (console.log('Some error is occured', err));
    //     !err && (done()); // Become from createTasks
    //   }
    // );

    done();
  },
  testProjects: function(data) {
    var parentTest = /\w+\-\d+/g;

    return _.map(data, function(task) {
      return task.match(parentTest) && task;
    });
  },
  checkSubtasks: function (data, next) {
    if (_.indexOf(_.values(data), 'on') < 0) {
      next( new Error('You must select one or more tasks.') ); // Become from init
    }

    next();
  },
  checkEqual: function(data, next) {
    var that = this;
    var uniqProjects = _.uniq(data.parentTask, function(string) {
      return string.toLowerCase();
    });
    var testUniq = that.testProjects(uniqProjects);

    this.projects = _.compact(testUniq);
    this.isEqualProjects = _.isEqual(that.projects.length, 1);

    if (_.contains(testUniq, null)) {
      next( new Error('Parent task must be like aloha-747.') ); // Become from init
    }

    next(); // Become from init
  },
  splitProjects: function(data, next) {
    var that = this;

    if (_.isEmpty(data.parentTask)) {
      next( new Error('Parent task must not be empy') ); // Become from init
    }

    var withOutSpaces = data.parentTask && data.parentTask.replace(/\s/g, '');
    var parentTasks = withOutSpaces.split(',');

    data.parentTask = parentTasks;

    next(); // Become from init
  },
  init: function(data, done) {
    var that = this;

    async.series([
      function(cb) {
        that.splitProjects(data, cb);
      },
      function(cb) {
        that.checkEqual(data, cb);
      },
      function(cb) {
        that.checkSubtasks(data, cb);
      },
      function(cb) {
        that.setProjects(cb);
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