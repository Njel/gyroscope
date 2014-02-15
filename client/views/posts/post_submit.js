Template.postSubmit.helpers({
  months: function() {
    return Months.find();
  },
  currDate: function() {
    var d = new Date();
    return {year: d.getFullYear(), month: d.getMonth()};
  }
});

Template.postSubmit.events({
  'submit form': function(event) {
  	event.preventDefault();

    var year = parseInt($(event.target).find('[name=year]').val());
    var month = parseInt($(event.target).find('[name=month]').val());
    var title = moment(new Date(year, month, 1)).format('MMMM YYYY');
  	var post = {
      title: title,
  	  year: year,
  	  month: (month + 1)
    };

    // console.log(post);

  	Meteor.call('post', post, function(error, id) {
  	  if (error) {
  	  	// display the error to the user
  	  	throwError(error.reason);

        if (error.error === 302)
        	Meteor.Router.to('postPage', error.details);
      } else {
      	Meteor.Router.to('postPage', id);
      }
    });
  }
});