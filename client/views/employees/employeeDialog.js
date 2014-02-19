Template.employeeDialog.helpers({
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

Template.employeeDialog.users = function() {
  return Meteor.users.find();
};

Template.employeeDialog.selectedEmployee = function() {
  return Session.get('selectedEmployee');
};

Template.employeeDialog.roles = function() {
  return Roles.find({}, {sort: {name: 1}});
};

Template.employeeDialog.groups = function() {
  return Groups.find({}, {sort: {name: 1}});
};

Template.employeeDialog.emp = function() {
  var empId = Session.get('selectedEmployee');

  if (empId) {
    var e = Employees.findOne(empId);
    if (e) {
      var cBy = Meteor.users.findOne(e.createdBy);
      if (cBy)
        createdBy = cBy.username;
      else
        createdBy = '<System Account>';
      var mBy = Meteor.users.findOne(e.modifiedBy);
      if (mBy)
        modifiedBy = mBy.username;
      else
        modifiedBy = '<System Account>';
      var grp = Groups.findOne(e.group);
      if (grp)
        groupName = grp.name;
      else
        groupName = "-";

      var emp = {
        fname: e.fname,
        lname: e.lname,
        email: e.email,
        roleId: e.roleId,
        userId: e.userId,
        group: groupName,
        status: e.status,
        AL: e.AL,
        SL: e.SL,
        active: e.active,
        createdBy: createdBy,
        created: new Date(e.created),
        modifiedBy: modifiedBy,
        modified: new Date(e.modified)
      }
    }
  } else {
    var emp = {
      fname: '',
      lname: '',
      email: '',
      roleId: '',
      userId: '',
      group: null,
      status: '',
      AL: 0,
      SL: 0,
      active: true
    }
  }
  return emp;
};

Template.employeeDialog.events({
  'click .cancel': function(evt, tmpl) {
    Session.set('selectedEmployee', null);
    Session.set('showDialogEmployee', false);
  },
  'click .close': function(evt, tmpl) {
    Session.set('selectedEmployee', null);
    Session.set('showDialogEmployee', false);
  },
  'click .add': function(evt, tmpl) {
    var e = {
      fname: tmpl.find('[name=fname]').value,
      lname: tmpl.find('[name=lname]').value,
      email: tmpl.find('[name=email]').value,
      roleId: tmpl.find('[name=role]').value,
      userId: tmpl.find('[name=userId]').value,
      group: tmpl.find('[name=group]').value,
      AL: tmpl.find('[name=al]').value,
      SL: tmpl.find('[name=sl]').value
    };
    
    // console.log(e);

    Meteor.call('employeeNew', e, function(error, eventId) {
      if (error) {
        error && throwError(error.reason);
      } else {
        throwMessage('New employee created successfully.');
        Session.set('selectedEmployee', null);
        Session.set('showDialogEmployee', false);
      }
    });
  },
  'click .save': function(evt, tmpl) {
    var e = {
      id: Session.get('selectedEmployee'),
      fname: tmpl.find('[name=fname]').value,
      lname: tmpl.find('[name=lname]').value,
      email: tmpl.find('[name=email]').value,
      roleId: tmpl.find('[name=role]').value,
      userId: tmpl.find('[name=userId]').value,
      group: tmpl.find('[name=group]').value,
      AL: tmpl.find('[name=al]').value,
      SL: tmpl.find('[name=sl]').value
    };

    // console.log(e);

    Meteor.call('employeeUpd', e, function(error, eventId) {
      if (error) {
        error && throwError(error.reason);
      } else {
        throwMessage('Employee updated successfully.');
        Session.set('selectedEmployee', null);
        Session.set('showDialogEmployee', false);
      }
    });
  }
});