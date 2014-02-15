Template.grpDelConfDialog.selectedGroup = function() {
  return Session.get('selectedGroup');
};

Template.grpDelConfDialog.grp = function() {
  var grpId = Session.get('selectedGroup');

  if (grpId) {
    var g = Groups.findOne(grpId);
    if (g) {
      var grp = {
        name: g.name,
        nbEmp: Employees.find({group: grpId}).count()
      }
    }
  } else {
    var grp = {
      name: '',
      nbEmp: 0
    }
  }
  return grp;
};

Template.grpDelConfDialog.events({
  'click .cancel': function(evt, tmpl) {
    Session.set('selectedGroup', null);
    Session.set('showDialogGrpDelConf', false);
  },
  'click .delete': function(evt, tmpl) {
    var g = {
      id: Session.get('selectedGroup')
    }

    Meteor.call('groupRemove', g, function(error, eventId) {
      if (error) {
        error && throwError(error.reason);
      } else {
        throwMessage('Group deleted successfully.');
        Session.set('selectedGroup', null);
        Session.set('showDialogGrpDelConf', false);
      }
    });
  }
});