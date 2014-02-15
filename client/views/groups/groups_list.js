Template.groups.helpers({
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
    return Groups.find();
  }
});

Template.groupsList.events({
});
