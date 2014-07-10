$(function() {

  // TODO: Add regexp for task check
  $('#jiraForm').on('submit', function(e) {
    e.preventDefault();
    var parentTask = $('#parentTask');
    var parentTaskCheck;
    var valid = false;
    var form = $(this);

    if (!parentTask.val()) {
      parentTask.parents().filter('.form-group').addClass('has-error');
      valid = false;
    } else {
      parentTask.parents().filter('.form-group').removeClass('has-error');
      valid = true;
    }

    valid && $.post('/', form.serialize());

  });

});