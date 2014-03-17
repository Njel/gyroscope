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
    var sch = Schedules.findOne(this._id);
    var currEmp = Employees.findOne({userId: currUser._id});
    if (sch && currEmp && sch.empId == currEmp._id)
      return true;
    if ((this.userId == currUser._id) || (this.createdBy == currUser._id))
      return true;
    if(currUser.username == 'Admin')
      return true;
    var adminRole = Roles.findOne({name: 'Admin'});
    if (adminRole) {
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
    // return Schedules.find({},{sort: {modified: -1}});
    return Schedules.find({}, Session.get('schedulesSortBy'));
  },
  sortBy: function(columnName) {
    if (Session.get('schedulesSort') == columnName) {
      var sortBy = Session.get('schedulesSortBy');
      if (sortBy.sort[columnName] == 1)
        // return 'icon-chevron-down';
        return 'fa fa-sort-asc';
      else
        // return 'icon-chevron-up';
        return 'fa fa-sort-desc';
    }
    else
      return '';
  }
});

Template.schedulesList.events({
    'click .orderBy': function(event) {
    event.preventDefault();
    // console.log("Column '" + event.toElement.name + "' clicked");
    var columnName = event.toElement.name;
    if (Session.get('schedulesSort') == columnName) {
      var sortBy = Session.get('schedulesSortBy');
      var s = -sortBy.sort[columnName];
    } else {
      var s = 1;
    }

    switch (columnName) {
      case 'emp':
        Session.set('schedulesSortBy', {sort: {emp: s}});
        break;
      case 'periodsCount':
        Session.set('schedulesSortBy', {sort: {periodsCount: s}});
        break;
      case 'hoursCount':
        Session.set('schedulesSortBy', {sort: {hoursCount: s}});
        break;
      case 'validS':
        Session.set('schedulesSortBy', {sort: {validS: s}});
        break;
      case 'validE':
        Session.set('schedulesSortBy', {sort: {validE: s}});
        break;
      case 'status':
        Session.set('schedulesSortBy', {sort: {status: s}});
        break;
    }
    Session.set('schedulesSort', columnName);
  }
});