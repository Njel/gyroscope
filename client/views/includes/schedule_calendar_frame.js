Template.scheduleCalendarFrame.lastCalPeriodMod = function() {
  var v = Settings.findOne({name: 'lastCalPeriodMod'});
  if (v)
    return v.value;
  else
    return null;
};

Template.scheduleCalendarFrame.helpers({
  isLocked: function() {
    if (isAdmin())
      return false;
    return (this.locked ? true : false);
  },
  isApproved: function() {
    return (Schedules.findOne(this._id).status == 'Approved');
  },
  hasPeriods: function() {
    return (Schedules.findOne(this._id).periodsCount > 0);
  },
  isAuthorized: function() {
    var currUser = Meteor.user();
    if (!currUser)
      return false;
    if(currUser.username == 'Admin')
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
  }
});

Template.scheduleCalendarFrame.events({
  'click #resetSchedule': function(evt, tmpl) {
    // console.log('Reset Calendar');
    evt.preventDefault();
    var periods = Periods.find({schId: this._id});
    periods.forEach(function(p) {
      var period = {periodId: p._id};
      Meteor.call('periodDel', period, function(error, eventId) {
        error && throwError(error.reason);
      });
    });
    var sch = {schId: this._id};
    Meteor.call('scheduleResetCounters', sch, function(error, eventId) {
      error && throwError(error.reason);
    });

    throwMessage('Schedule reset successfully.');
  },
  'click #genWYearDays': function(evt, tmpl) {
    // console.log(evt.toElement.id);
    evt.preventDefault();

    var empId = this.empId;

    var sYear = parseInt(this.validS.substring(0, 4));
    var sMonth = parseInt(this.validS.substring(6, 8));

    var eYear = parseInt(this.validE.substring(0, 4));
    var eMonth = parseInt(this.validE.substring(5, 7));

    var Y = sYear;
    var M = sMonth - 1;
    var n = 0;

    while ((Y * 100 + M) < (eYear * 100 + eMonth)) {
      var title = moment(new Date(Y, M, 1)).format('MMMM YYYY');
      // console.log('Creating timesheet ' + Y + '-' + M + ': ' + title);

      var post = {
        empId: empId,
        title: title,
        year: Y,
        month: M + 1,
        schId: this._id,
        type: 'W'
      };

      Meteor.call('postGenEvents', post, function(error, id) {
        if (error) {
          // display the error to the user
          throwError(error.reason);

          if (error.error === 302) {
          }
        // } else {
        //   Meteor.Router.to('postPage', id);
        } else {
          // throwMessage('New month created successfully.');
        }
      });

      M = M + 1;
      if (M == 12) {
        M = 0;
        Y = Y + 1;
      }
      n++;
    }
    throwMessage(n + ' new month(s) created successfully.');

    var s = Settings.findOne({name: 'lastCalEventMod'});
    Settings.update(s._id, {$set: {value: new Date()}});
    // Session.set('lastCalEventMod', new Date());
  }
});

function hasAccess() {
  var currUser = Meteor.user();
  if (!currUser)
    return false;
  var sch = Schedules.findOne(Session.get('currentScheduleId'));
  if (sch && sch.locked)
    return false;
  var currEmp = Employees.findOne({userId: currUser._id});
  if (sch && currEmp && sch.empId == currEmp._id)
    return true;
  if (currEmp && ((currEmp._id == currUser._id) || (this.createdBy == currUser._id)))
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
}