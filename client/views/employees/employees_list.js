Template.employees.helpers({
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

Template.employeesList.helpers({
  employees: function() {
    return Employees.find();
  }
});

Template.employeesList.events({
});
