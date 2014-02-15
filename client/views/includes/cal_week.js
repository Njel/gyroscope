Template.calWeek.helpers({
  currentSchedule: function() {
  	return Schedules.findOne(Session.get('currentScheduleId'));
  },
  periods: function() {
  	return Periods.find({schId: this._id});
  }
});

Template.calWeek.showDialogCalPeriod = function() {
  return Session.get('showDialogCalPeriod');
};

Template.calWeek.lastCalPeriodMod = function() {
  return Session.get('lastCalPeriodMod');
};