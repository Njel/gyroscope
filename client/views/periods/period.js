Template.period.helpers({
  dayTxt: function(p) {
    return moment(new Date('2010-01-0' + (3 + p.day).toString() + 'T12:00:00.000Z')).format('ddd');
  },
	period: function(p) {
    var sD = moment(new Date('2010-01-0' + (3 + p.day).toString() + 'T' + p.start + ':00.000Z'));
    var eD = moment(new Date('2010-01-0' + (3 + p.day).toString() + 'T' + p.end + ':00.000Z'));
  	return sD.format('HH:mm') + ' - ' + eD.format('HH:mm');
	},
  calcHours: function(p) {
    var start = new Date('2010-01-0' + (3 + p.day).toString() + 'T' + p.start + ':00.000Z');
    var end = new Date('2010-01-0' + (3 + p.day).toString() + 'T' + p.end + ':00.000Z');
    if (end < start)
      return ((moment(end).add('d', 1) - moment(start)) / 1000 / 60 / 60) + ' hour(s)';
    else
      return ((end - start) / 1000 / 60 / 60) + ' hour(s)';
  }
});

Template.period.events({
  'click .delete': function(event) {
    event.preventDefault();
    var p = {periodId: this._id};

    //Meteor.call('eventDel', this._id);
    Meteor.call('periodDel', p, function(error, eventId) {
      error && throwError(error.reason);
    });

    var s = Settings.findOne({name: 'lastCalPeriodMod'});
    Settings.update(s._id, {$set: {value: new Date()}});
  	Session.set('lastCalPeriodMod', new Date());
  }
});