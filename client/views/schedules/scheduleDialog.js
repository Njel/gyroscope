Template.scheduleDialog.helpers({
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
  },
  employees: function() {
    return Employees.find();
  }
});

Template.scheduleDialog.selectedSchedule = function() {
  return Session.get('selectedSchedule');
};

Template.scheduleDialog.sch = function() {
  var schId = Session.get('selectedSchedule');

  if (schId) {
    var s = Schedules.findOne(schId);
    if (s) {
      var cBy = Meteor.users.findOne(s.createdBy);
      if (cBy)
        createdBy = cBy.username;
      else
        createdBy = '<System Account>';
      var mBy = Meteor.users.findOne(s.modifiedBy);
      if (mBy)
        modifiedBy = mBy.username;
      else
        modifiedBy = '<System Account>';

      var sch = {
        empId: s.empId,
        periodsCount: s.periodsCount,
        hoursCount: s.hoursCount,
        validS: s.validS,
        validE: s.validE,
        status: s.status,
        createdBy: createdBy,
        created: new Date(s.created),
        modifiedBy: modifiedBy,
        modified: new Date(s.modified)
      }
    }
  } else {
    var sch = {
      empId: '',
      periodsCount: '',
      hoursCount: '',
      validS: '',
      validE: '',
      status: ''
    }
  }
  return sch;
};

Template.scheduleDialog.events({
  'click .cancel': function(evt, tmpl) {
    Session.set('selectedSchedule', null);
    Session.set('showDialogSchedule', false);
  },
  'click .close': function(evt, tmpl) {
    Session.set('selectedSchedule', null);
    Session.set('showDialogSchedule', false);
  },
  'click .add': function(evt, tmpl) {
    var s = {
      empId: tmpl.find('[name=empId]').value,
      validS: tmpl.find('[name=validS]').value,
      validE: tmpl.find('[name=validE]').value,
      status: tmpl.find('[name=status]').value
    };
    
    // console.log(e);

    Meteor.call('scheduleNew', s, function(error, eventId) {
      if (error) {
        error && throwError(error.reason);
      } else {
        throwMessage('New schedule created successfully.');
        Session.set('selectedSchedule', null);
        Session.set('showDialogSchedule', false);
      }
    });
  },
  'click .save': function(evt, tmpl) {
    var s = {
      id: Session.get('selectedSchedule'),
      empId: tmpl.find('[name=empId]').value,
      validS: tmpl.find('[name=validS]').value,
      validE: tmpl.find('[name=validE]').value,
      status: tmpl.find('[name=status]').value
    };

    // console.log(s);

    Meteor.call('scheduleUpd', s, function(error, eventId) {
      if (error) {
        error && throwError(error.reason);
      } else {
        throwMessage('Schedule updated successfully.');
        Session.set('selectedSchedule', null);
        Session.set('showDialogSchedule', false);
      }
    });
  }
});