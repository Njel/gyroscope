Template.holidays.helpers({
  hasAccess: function() {
    var currUser = Meteor.user();
    if (!currUser)
      return false;
    if (this.createdBy == currUser._id)
      return true;
    if(currUser.username == 'Admin')
      return true;
    var adminRole = Roles.findOne({name: 'Admin'});
    if (adminRole) {
      var currEmp = Employees.findOne({userId: currUser._id});
      if (currEmp && (currEmp.roleId == adminRole._id || currEmp._id == this.empId)) {
        return true;
      }
    }
    return false;
  }
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