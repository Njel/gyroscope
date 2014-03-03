Template.groups.helpers({
  hasAccess: function() {
    var currUser = Meteor.user();
    if (!currUser)
      return false;
    if (this.createdBy == currUser._id)
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
  }
});

Template.groups.events({
  'click .add': function(event) {
  	// console.log('Add group click');
  	event.preventDefault();
    Session.set('selectedGroup', null);
    Session.set('showDialogGroup', true);
  }
});

Template.groups.showDialogGroup = function() {
  return Session.get('showDialogGroup');
};

Template.groups.showDialogGrpDelConf = function() {
  return Session.get('showDialogGrpDelConf');
};

Template.groupsList.helpers({
  groups: function() {
    return Groups.find({}, {sort: {name: 1}});
  }
});

Template.groupsList.events({
});
