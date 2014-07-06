var JiraApi = require('jira').JiraApi;
var config = require('./config');
var jira = new JiraApi(config.protocol, config.host, config.port, config.user, config.password, '2', true, true);


/*
jira.addComment('ECOMCHIV-1197', 'Comment send from node app', function (err, resp) {
  console.log('Err: ', err);
  console.log('resp: ', resp);
});

jira.getUsersIssues('"Nikita Zubarets"', true, function(error, issues) {
  console.log('getUserIssues ERROR: ', error);
  console.log('getUserIssues issues: ', issues);
});

jira.findIssue('ALOHA-741', function(error, response) {
  console.log(response);
});
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

var createdIssue = {
  id: 676253,
  name: 'ALOHA-757'
};

var updateIssue = {
  'update': {
    'summary': [{'set': 'Some updated summary from nodeJS app'}]
  }
}

jira.deleteIssue(createdIssueID, function(err, res) {
  console.log(err);
  console.log(res);
});

/*
jira.getProject('ALOHA', function(err, res) {
  console.log(err);
  console.log(res);
});

jira.updateIssue(createdIssueID, updateIssue, function(err, res) {
  console.log(err);
  console.log(res);
});

jira.addNewIssue(newIssue, function(err,res) {
  console.log(err);
  console.log(res);
})
*/
