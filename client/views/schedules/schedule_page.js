Template.schedulePage.helpers({
  currentSchedule: function() {
  	var d = moment(new Date()).format('YYYY-MM-DD');
  	var s = Schedules.findOne({empId: Session.get('currentEmpId'), validS: {$lte: d}, validE: {$gte: d}});
  	if (s)
  		Session.set('currentScheduleId', s._id);
  	return s;
  },
  periods: function() {
  	return Periods.find({schId: this._id},{sort: {day: 1, start: 1}});
  }
});