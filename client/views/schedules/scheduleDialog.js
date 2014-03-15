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
      if (currEmp && currEmp.roleId == adminRole._id) {
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
  var currUser = Meteor.user();
  if (!currUser)
    return null;

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
    var currEmp = Employees.findOne({userId: currUser._id});
    if(currEmp) {
      var sch = {
        empId: currEmp._id,
        periodsCount: null,
        hoursCount: null,
        validS: '',
        validE: '',
        status: ''
      };
    } else {
      var sch = {
        empId: null,
        periodsCount: null,
        hoursCount: null,
        validS: '',
        validE: '',
        status: ''
      };
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
  },
  'change #validS': function(evt, tmpl) {
    var t = evt.target.value;
    if (t == '-') {
      t = moment(new Date()).format('YYYY-MM-DD');
    } else {
      if (t.length == 4) {
        t = t + '-01-01';
      } else {
        if (t.length == 8) {
          p = t.indexOf('-');
          if (p == -1)
            t = t.substring(0, 4) + '-' + t.substring(4, 6) + '-' + t.substring(6, 8);
          else
            if (p != 5)
              t = '';
            else
              t = t.substring(0, 5) + '0' + t.substring(5, 7) + '0' + t.substring(7, 8);
        } else {
          t = '';
        }
      }
    }
    evt.target.value = t;
    if (tmpl.find('[name=validE]').value == '')
      tmpl.find('[name=validE]').value = t.substring(0, 5) + '12-31';
  },
  'change #validE': function(evt, tmpl) {
    var t = evt.target.value;
    if (t == '-') {
      t = moment(new Date()).format('YYYY-MM-DD');
    } else {
      if (t.length == 4) {
        t = t + '-12-31';
      } else {
        if (t.length == 8) {
          p = t.indexOf('-');
          if (p == -1)
            t = t.substring(0, 4) + '-' + t.substring(4, 6) + '-' + t.substring(6, 8);
          else
            if (p != 5)
              t = '';
            else
              t = t.substring(0, 5) + '0' + t.substring(5, 7) + '0' + t.substring(7, 8);
        } else {
          t = '';
        }
      }
    }
    evt.target.value = t;
  }
});