Template.event.helpers({
	period: function(e) {
	  if(e.allDay) {
	  	return 'All day';
	  } else {
	  	return moment(new Date(e.start)).format('HH:mm') + ' - ' + moment(new Date(e.end)).format('HH:mm');
	  }
	},
  calcHours: function(e) {
    var start = new Date(e.start);
    var end = new Date(e.end);
    return ((end - start) / 1000 / 60 / 60) + ' hour(s)';
  }
});

Template.event.events({
  'click .delete': function(event) {
    event.preventDefault();
    var ev = {eventId: this._id};

    //Meteor.call('eventDel', this._id);
    Meteor.call('eventDel', ev, function(error, eventId) {
      error && throwError(error.reason);
    });

    var s = Settings.findOne({name: 'lastCalEventMod'});
    Settings.update(s._id, {$set: {value: new Date()}});
  	Session.set('lastCalEventMod', new Date());
  }
});