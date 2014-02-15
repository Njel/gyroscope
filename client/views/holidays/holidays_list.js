Template.holidays.helpers({
});

Template.holidays.events({
  'click .add': function(event) {
  	// console.log('Add group click');
  	event.preventDefault();
    Session.set('selectedHoliday', null);
    Session.set('showDialogHoliday', true);
  }
});

Template.holidays.showDialogHoliday = function() {
  return Session.get('showDialogHoliday');
};

Template.holidays.showDialogHolDelConf = function() {
  return Session.get('showDialogHolDelConf');
};

Template.holidaysList.helpers({
  holidays: function() {
  	var today = new Date();
  	var d = moment(today).subtract('days', today.getDate()).subtract('months', 2).format('YYYY-MM-DD');
    return Holidays.find({date: {$gt: d}}, {sort: {date: 1}});
  }
});