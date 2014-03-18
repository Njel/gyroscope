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
    Session.set('selectedEmployee', {action: 'Add', empId: null});
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
    // return Employees.find({}, {sort: {fname: 1, lname: 1}});
    return Employees.find({}, Session.get('employeesSortBy'));
  },
  sortBy: function(columnName) {
    if (Session.get('employeesSort') == columnName) {
      var sortBy = Session.get('employeesSortBy');
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

Template.employeesList.events({
  'click .orderBy': function(event) {
    event.preventDefault();
    // console.log("Column '" + event.toElement.name + "' clicked");
    var columnName = event.toElement.name;
    if (Session.get('employeesSort') == columnName) {
      var sortBy = Session.get('employeesSortBy');
      var s = -sortBy.sort[columnName];
    } else {
      var s = 1;
    }

    switch (columnName) {
      case 'role':
        Session.set('employeesSortBy', {sort: {role: s}});
        break;
      case 'supervisor':
        Session.set('employeesSortBy', {sort: {supervisor: s}});
        break;
      case 'user':
        Session.set('employeesSortBy', {sort: {user: s}});
        break;
      case 'group':
        Session.set('employeesSortBy', {sort: {group: s}});
        break;
      case 'fname':
        Session.set('employeesSortBy', {sort: {fname: s, lname: s}});
        break;
    }
    Session.set('employeesSort', columnName);
  }
});
