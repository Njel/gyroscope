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
    // return Groups.find({}, {sort: {name: 1}});
    return Groups.find({}, Session.get('groupsSortBy'));
  },
  sortBy: function(columnName) {
    if (Session.get('groupsSort') == columnName) {
      var sortBy = Session.get('groupsSortBy');
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

Template.groupsList.events({
  'click .orderBy': function(event) {
    event.preventDefault();
    // console.log("Column '" + event.toElement.name + "' clicked");
    var columnName = event.toElement.name;
    if (Session.get('groupsSort') == columnName) {
      var sortBy = Session.get('groupsSortBy');
      var s = -sortBy.sort[columnName];
    } else {
      var s = 1;
    }

    switch (columnName) {
      case 'name':
        Session.set('groupsSortBy', {sort: {name: s}});
        break;
      case 'nbEmp':
        Session.set('groupsSortBy', {sort: {nbEmp: s}});
        break;
    }
    Session.set('groupsSort', columnName);
  }
});