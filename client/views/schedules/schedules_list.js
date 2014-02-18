Template.schedules.lastSchMod = function() {
  var s = Settings.findOne({name: 'lastSchMod'});
  if (s)
    return s.value;
  else
   return null;
};

Template.schedules.helpers({
  isAuthorized: function() {
    var currUser = Meteor.user();
    if (!currUser)
      return false;
    if(currUser.username == 'Admin')
      return true;
    var currEmp = Employees.findOne({userId: currUser._id});
    if (currEmp)
      return true;
    return false;
  },
  hasAccess: function() {
    var currUser = Meteor.user();
    if (!currUser)
      return false;
    if ((this.userId == currUser._id) || (this.createdBy == currUser._id))
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
  },
  isAdmin: function() {
    var currUser = Meteor.user();
    if (!currUser)
      return false;
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

Template.schedules.events({
  'click .add': function(event) {
    // console.log('Add schedule click');
    event.preventDefault();
    Session.set('selectedSchedule', null);
    Session.set('showDialogSchedule', true);
  }
});

Template.schedules.showDialogSchedule = function() {
  return Session.get('showDialogSchedule');
};

Template.schedules.showDialogSchDelConf = function() {
  return Session.get('showDialogSchDelConf');
};

// SchedulesList template

Template.schedulesList.helpers({
  schedules: function() {
    return Schedules.find();
  }
});