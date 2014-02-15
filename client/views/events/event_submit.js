Template.eventSubmit.events({
  'submit form': function(event, template) {
  	event.preventDefault();

  	var ev = {
      day: $(event.target).find('[name=day]').val(),
      type: $(event.target).find('[name=type]').val(),
      stime: $(event.target).find('[name=stime]').val(),
      etime: $(event.target).find('[name=etime]').val(),
  	  title: $(event.target).find('[name=title]').val(),
  	  postId: template.data._id
  	};

  	Meteor.call('event', ev, function(error, eventId) {
      error && throwError(error.reason);
  	});
  }
});