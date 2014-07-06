var JiraApi = require('jira').JiraApi;
var config = require('./config');
var jira = new JiraApi(config.protocol, config.host, config.port, config.user, config.password, '2', true, true);

/*
  TODO: Set status
  TODO: Set fixversions
  TODO: Set priority

  PROBLEM: Can't delete issue, permissions fail
*/

var newIssue = {
  'fields': {
    'project': { 'key': 'ALOHA' },
    'summary': 'Some summary for the ticket',
    'description': 'Some description for the ticket',
    'issuetype': { 'name': 'Bug' },
    'customfield_10891': [ { 'id' : '13248' } ]
  }
};

var newSubIssue = {
  'fields': {
    'project': { 'key': 'ALOHA' },
    'parent': { 'key': 'ALOHA-757' },
    'summary': 'DEV: Test subtask 1',
    'description': 'Some test description',
    'priority': { 'name': 'P3' },
    'issuetype': { 'name': 'Sub-task' },
    'assignee': { 'name': 'nikita.zubarets' }
  }
};

var updateIssue = {
  'update': {
    'priority': [ { 'set': { 'name': 'P2' } } ]
  }
};

var createdIssues = {
  task: {
    id: 676253,
    name: 'ALOHA-757'
  },
  subtask: {
    id: 678584,
    name: 'ALOHA-759'
  }
};

jira.addNewIssue(newSubIssue, function(err,res) {
  console.log(err);
  console.log(res);
});