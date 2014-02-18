Template.empDelConfDialog.selectedEmployee = function() {
  return Session.get('selectedEmployee');
};

Template.empDelConfDialog.emp = function() {
  var empId = Session.get('selectedEmployee');

  if (empId) {
    var e = Employees.findOne({_id: empId});
    if (e) {
      // var cBy = Meteor.users.findOne(e.createdBy);
      // if (cBy)
      //   createdBy = cBy.username;
      // else
      //   createdBy = '<System Account>';
      // var mBy = Meteor.users.findOne(e.modifiedBy);
      // if (mBy)
      //   modifiedBy = mBy.username;
      // else
      //   modifiedBy = '<System Account>';
      var emp = {
        fname: e.fname,
        lname: e.lname,
        email: e.email,
        // group: Groups.findOne(e.group).name,
        // status: e.status,
        // AL: e.AL,
        // SL: e.SL,
        // active: e.active,
        // createdBy: createdBy,
        // created: new Date(e.created),
        // modifiedBy: modifiedBy,
        // modified: new Date(e.modified)
      }
    }
  } else {
    var emp = {
      fname: '',
      lname: '',
      email: '',
      // group: null,
      // status: '',
      // AL: 0,
      // SL: 0,
      // active: true
    }
  }
  return emp;
};

Template.empDelConfDialog.events({
  'click .cancel': function(evt, tmpl) {
    Session.set('selectedEmployee', null);
    Session.set('showDialogEmpDelConf', false);
  },
  'click .close': function(evt, tmpl) {
    Session.set('selectedEmployee', null);
    Session.set('showDialogEmpDelConf', false);
  },
  'click .delete': function(evt, tmpl) {
    var e = {
      id: Session.get('selectedEmployee')
    }

    Meteor.call('employeeRemove', e, function(error, eventId) {
      if (error) {
        error && throwError(error.reason);
      } else {
        throwMessage('Employee deleted successfully.');
        Session.set('selectedEmployee', null);
        Session.set('showDialogEmpDelConf', false);
      }
    });
  }
});