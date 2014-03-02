Template.employees.lastEmpMod = function() {
  var s = Settings.findOne({name: 'lastEmpMod'});
  if (s)
    return s.value;
  else
   return null;
};

Template.employees.helpers({
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

Template.employees.events({
  'click .add': function(event) {
  	// console.log('Add employee click');
  	event.preventDefault();
    Session.set('selectedEmployee', null);
    Session.set('showDialogEmployee', true);
  },
  'click .add-group': function(event) {
  	// console.log('Add group click');
  	event.preventDefault();
    Session.set('selectedGroup', null);
    Session.set('showDialogGroup', true);
  }
});

Template.employees.showDialogEmployee = function() {
  return Session.get('showDialogEmployee');
};

Template.employees.showDialogEmpDelConf = function() {
  return Session.get('showDialogEmpDelConf');
};

Template.employees.showDialogGroup = function() {
  return Session.get('showDialogGroup');
};

// EmployeesList template

Template.employeesList.helpers({
  employees: function() {
    return Employees.find({}, {sort: this.fname, sort: this.lname});
  }
});

Template.employeesList.events({
});
